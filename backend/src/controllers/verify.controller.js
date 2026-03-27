const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const mrz = require('mrz');
const pool = require('../db/pool');
const {
  RekognitionClient,
  CreateFaceLivenessSessionCommand,
  GetFaceLivenessSessionResultsCommand,
} = require('@aws-sdk/client-rekognition');

require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const PASSPORT_FUNCTION_URL = process.env.PASSPORT_FUNCTION_URL;
const IDENTITY_SALT = process.env.IDENTITY_SALT;

// Toggle: true = mock (always passes), false = real AWS Rekognition
const MOCK_VERIFICATION = false;

// Minimum confidence score (0-100) to pass liveness
const LIVENESS_CONFIDENCE_THRESHOLD = 75;

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/* ------------------------------
   POST /verify/liveness/session
   Creates an AWS liveness session and returns the session ID to the app
------------------------------ */
exports.createLivenessSession = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    if (MOCK_VERIFICATION) {
      return res.json({ sessionId: `mock-session-${userId}` });
    }

    const command = new CreateFaceLivenessSessionCommand({});
    const response = await rekognition.send(command);

    return res.json({ sessionId: response.SessionId });

  } catch (err) {
    console.error('Failed to create liveness session:', err);
    return res.status(500).json({ error: 'Failed to create liveness session' });
  }
};

/* ------------------------------
   POST /verify/liveness/confirm
   Retrieves liveness result from AWS and stores verification if passed
------------------------------ */
exports.confirmLiveness = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    if (MOCK_VERIFICATION) {
      await pool.query(
        `INSERT INTO verifications (user_id, type, level, passport_hash, issued_at, expires_at)
         VALUES ($1, 'liveness', 1, NULL, NOW(), NOW() + INTERVAL '1 year')`,
        [userId]
      );
      await pool.query(
        `UPDATE users SET verification_tier = GREATEST(verification_tier, 1) WHERE id = $1`,
        [userId]
      );
      return res.json({ success: true, level: 1, type: 'liveness', mock: true });
    }

    const command = new GetFaceLivenessSessionResultsCommand({ SessionId: sessionId });
    const result = await rekognition.send(command);

    const confidence = result.Confidence ?? 0;
    const passed = confidence >= LIVENESS_CONFIDENCE_THRESHOLD;

    if (!passed) {
      return res.status(400).json({
        error: 'Liveness check failed',
        confidence,
      });
    }

    await pool.query(
      `INSERT INTO verifications (user_id, type, level, passport_hash, issued_at, expires_at)
       VALUES ($1, 'liveness', 1, NULL, NOW(), NOW() + INTERVAL '1 year')`,
      [userId]
    );

    await pool.query(
      `UPDATE users SET verification_tier = GREATEST(verification_tier, 1) WHERE id = $1`,
      [userId]
    );

    return res.json({ success: true, level: 1, type: 'liveness', confidence });

  } catch (err) {
    console.error('Liveness confirmation failed:', err);
    return res.status(500).json({ error: 'Liveness confirmation failed' });
  }
};


exports.verifyPassport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    if (MOCK_VERIFICATION) {
      const proofHash = `mock_passport_${userId}`;

      await pool.query(
        `
        INSERT INTO verifications (
          user_id, type, level, passport_hash, issued_at, expires_at
        )
        VALUES ($1, 'passport', 2, $2, NOW(), NOW() + INTERVAL '6 months')
        `,
        [userId, proofHash]
      );

      await pool.query(
        `
        UPDATE users
        SET verification_tier = GREATEST(verification_tier, 2)
        WHERE id = $1
        `,
        [userId]
      );

      return res.json({ success: true, level: 2, type: "passport", mock: true });
    }

    // Real cloud function
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname || "passport.jpg",
      contentType: req.file.mimetype || "image/jpeg",
    });

    const cfResponse = await axios.post(PASSPORT_FUNCTION_URL, form, {
      headers: form.getHeaders(),
      timeout: 60000,
    });

    const { mrz_lines } = cfResponse.data;
    if (!mrz_lines || mrz_lines.length < 2) {
      return res.status(400).json({ error: "MRZ not detected" });
    }

    const mrzResult = mrz.parse(mrz_lines);
    if (!mrzResult.valid) {
      return res.status(400).json({ error: "MRZ validation failed", details: mrzResult.errors });
    }

    const f = mrzResult.fields;
    const proofString = `${f.documentNumber}|${f.issuingCountry}|${f.expirationDate}`;

    if (!IDENTITY_SALT) {
      throw new Error("IDENTITY_SALT not set");
    }

    const proofHash = crypto
      .createHmac("sha256", IDENTITY_SALT)
      .update(proofString)
      .digest("hex");

    await pool.query(
      `
      INSERT INTO verifications (
        user_id, type, level, passport_hash, issued_at, expires_at
      )
      VALUES ($1, 'passport', 2, $2, NOW(), NOW() + INTERVAL '10 years')
      `,
      [userId, proofHash]
    );

    await pool.query(
      `
      UPDATE users
      SET verification_tier = GREATEST(verification_tier, 2)
      WHERE id = $1
      `,
      [userId]
    );

    return res.json({ success: true, level: 2, type: "passport" });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "This passport is already verified on another account" });
    }
    console.error("Passport verification failed:", err);
    return res.status(500).json({ error: "Passport verification failed" });
  }
};


exports.verifyResidence = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const passportResult = await pool.query(
      `
      SELECT expires_at
      FROM verifications
      WHERE user_id = $1
        AND type = 'passport'
        AND revoked = false
        AND expires_at > NOW()
      ORDER BY expires_at DESC
      LIMIT 1
      `,
      [userId]
    );

    if (!passportResult.rows.length) {
      return res.status(400).json({ error: "Passport required first" });
    }

    const passportExpiry = passportResult.rows[0].expires_at;

    if (MOCK_VERIFICATION) {
      await pool.query(
        `
        INSERT INTO verifications (
          user_id, type, level, issued_at, expires_at
        )
        VALUES ($1, 'residence', 3, NOW(), $2)
        `,
        [userId, passportExpiry]
      );

      await pool.query(
        `
        UPDATE users
        SET verification_tier = GREATEST(verification_tier, 3)
        WHERE id = $1
        `,
        [userId]
      );

      return res.json({ verified: true, level: 3, score: 100, mock: true });
    }

    // Real mode — IP geolocation check
    let score = 40;

    const rawIp =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress;
    const ip = rawIp?.replace('::ffff:', '');

    const geo = await axios.get(`https://ipapi.co/${ip}/json/`);
    if (geo.data.country === "IE") {
      score += 40;
    }

    const verified = score >= 80;

    if (verified) {
      await pool.query(
        `
        INSERT INTO verifications (
          user_id, type, level, issued_at, expires_at
        )
        VALUES ($1, 'residence', 3, NOW(), $2)
        `,
        [userId, passportExpiry]
      );

      await pool.query(
        `
        UPDATE users
        SET verification_tier = GREATEST(verification_tier, 3)
        WHERE id = $1
        `,
        [userId]
      );
    }

    return res.json({ verified, level: verified ? 3 : 2, score });

  } catch (err) {
    console.error("Residence verification failed:", err);
    return res.status(500).json({ error: "Residence verification failed" });
  }
};


exports.getVerificationSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT level, expires_at
      FROM verifications
      WHERE user_id = $1
        AND revoked = false
        AND expires_at > NOW()
      ORDER BY level DESC
      LIMIT 1
      `,
      [userId]
    );

    if (!result.rows.length) {
      return res.json({ currentTier: 0, expiresAt: null });
    }

    const latest = result.rows[0];
    return res.json({ currentTier: latest.level, expiresAt: latest.expires_at });

  } catch (err) {
    console.error("Failed to fetch verification summary:", err);
    return res.status(500).json({ error: "Failed to fetch summary" });
  }
};
