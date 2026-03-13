const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const mrz = require('mrz');
const pool = require('../db/pool');


const PASSPORT_FUNCTION_URL = process.env.PASSPORT_FUNCTION_URL;
const LIVENESS_FUNCTION_URL = process.env.LIVENESS_FUNCTION_URL;
const IDENTITY_SALT = process.env.IDENTITY_SALT;
const MOCK_VERIFICATION = true;

exports.verifyLiveness = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user.id; // from JWT middleware
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    if (MOCK_VERIFICATION) {
  await pool.query(
    `
    INSERT INTO verifications (
      user_id,
      type,
      level,
      passport_hash,
      issued_at,
      expires_at
    )
    VALUES ($1, 'liveness', 1, NULL, NOW(), NOW() + INTERVAL '1 year')
    `,
    [userId]
  );

  await pool.query(
    `
    UPDATE users
    SET verification_tier = GREATEST(verification_tier, 1)
    WHERE id = $1
    `,
    [userId]
  );

  return res.json({
    success: true,
    level: 1,
    type: "liveness",
    mock: true
  });
}

    /* --------------------------------------------------
       1. Forward image to Cloud Function
    -------------------------------------------------- */

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname || "selfie.jpg",
      contentType: req.file.mimetype || "image/jpeg",
    });

    const cfResponse = await axios.post(
      LIVENESS_FUNCTION_URL,
      form,
      {
        headers: form.getHeaders(),
        timeout: 60000,
      }
    );

    const { success } = cfResponse.data;

    if (!success) {
      return res.status(400).json({
        error: "Liveness check failed",
      });
    }

    /* --------------------------------------------------
       2. Store verification
    -------------------------------------------------- */

    await pool.query(
      `
      INSERT INTO verifications (
        user_id,
        type,
        level,
        passport_hash,
        issued_at,
        expires_at
      )
      VALUES ($1, 'liveness', 1, NULL, NOW(), NOW() + INTERVAL '7 days')
      `,
      [userId]
    );

    /* --------------------------------------------------
       3. Update user tier
    -------------------------------------------------- */

    await pool.query(
      `
      UPDATE users
      SET verification_tier = GREATEST(verification_tier, 1)
      WHERE id = $1
      `,
      [userId]
    );

    return res.json({
      success: true,
      level: 1,
      type: "liveness",
    });

  } catch (err) {
    console.error("Liveness verification failed:", err);

    return res.status(500).json({
      error: "Liveness verification failed",
    });
  }
};



exports.verifyPassport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user.id; // from JWT middleware
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    if (MOCK_VERIFICATION) {
  const proofHash = `mock_passport_${userId}`;

  await pool.query(
    `
    INSERT INTO verifications (
      user_id,
      type,
      level,
      passport_hash,
      issued_at,
      expires_at
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

  return res.json({
    success: true,
    level: 2,
    type: "passport",
    mock: true
  });
}

    /* --------------------------------------------------
       1. Send image to OCR Cloud Function
    -------------------------------------------------- */
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

    /* --------------------------------------------------
       2. Parse MRZ
    -------------------------------------------------- */
    const mrzResult = mrz.parse(mrz_lines);
    if (!mrzResult.valid) {
      return res.status(400).json({
        error: "MRZ validation failed",
        details: mrzResult.errors,
      });
    }

    const f = mrzResult.fields;

    /* --------------------------------------------------
       3. Build & hash proof signal
    -------------------------------------------------- */
    const proofString = `${f.documentNumber}|${f.issuingCountry}|${f.expirationDate}`;

    // Ensure secret exists
    if (!IDENTITY_SALT) {
      throw new Error("IDENTITY_SALT not set");
    }

    // Use HMAC for keyed hashing
    const proofHash = crypto
      .createHmac("sha256", IDENTITY_SALT)
      .update(proofString)
      .digest("hex");

    /* --------------------------------------------------
       4. Store verification
    -------------------------------------------------- */
    await pool.query(
      `
      INSERT INTO verifications (
        user_id,
        type,
        level,
        passport_hash,
        issued_at,
        expires_at
      )
      VALUES ($1, 'passport', 2, $2, NOW(), NOW() + INTERVAL '10 years')
      `,
      [userId, proofHash]
    );

    /* --------------------------------------------------
       5. Update cached verification level on users
    -------------------------------------------------- */
    await pool.query(
      `
      UPDATE users
      SET verification_tier = GREATEST(verification_tier, 2)
      WHERE id = $1
      `,
      [userId]
    );

    return res.json({
      success: true,
      level: 2,
      type: "passport",
    });

  } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({
          error: "This passport is already verified on another account"
        });
      }
      throw err;
    }
};

exports.verifyResidence = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Always fetch passport expiry first
    const passportResult = await pool.query(`
      SELECT expires_at
      FROM verifications
      WHERE user_id = $1
      AND type = 'passport'
      AND revoked = false
      AND expires_at > NOW()
      ORDER BY expires_at DESC
      LIMIT 1
    `, [userId]);

    if (!passportResult.rows.length) {
      return res.status(400).json({ error: "Passport required first" });
    }

    const passportExpiry = passportResult.rows[0].expires_at;

    // MOCK MODE
    if (MOCK_VERIFICATION) {
      await pool.query(`
        INSERT INTO verifications (
          user_id,
          type,
          level,
          issued_at,
          expires_at
        )
        VALUES ($1, 'residence', 3, NOW(), $2)
      `, [userId, passportExpiry]);

      await pool.query(`
        UPDATE users
        SET verification_tier = GREATEST(verification_tier, 3)
        WHERE id = $1
      `, [userId]);

      return res.json({
        verified: true,
        level: 3,
        score: 100,
        mock: true
      });
    }

    // REAL MODE
    let score = 40; // base score for having passport

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
      await pool.query(`
        INSERT INTO verifications (
          user_id,
          type,
          level,
          issued_at,
          expires_at
        )
        VALUES ($1, 'residence', 3, NOW(), $2)
      `, [userId, passportExpiry]);

      await pool.query(`
        UPDATE users
        SET verification_tier = GREATEST(verification_tier, 3)
        WHERE id = $1
      `, [userId]);
    }

    return res.json({
      verified,
      level: verified ? 3 : 2,
      score
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Residence verification failed" });
  }
};