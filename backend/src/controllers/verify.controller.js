const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const mrz = require('mrz');
const pool = require('../db/pool');


const PASSPORT_FUNCTION_URL = process.env.PASSPORT_FUNCTION_URL;
const LIVENESS_FUNCTION_URL = process.env.LIVENESS_FUNCTION_URL;
const IDENTITY_SALT = process.env.IDENTITY_SALT;
const MOCK_VERIFICATION = process.env.MOCK_VERIFICATION === "true";

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
    VALUES ($1, 'passport', 2, $2, NOW(), NOW() + INTERVAL '1 year')
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
      VALUES ($1, 'liveness', 1, NULL, NOW(), NOW() + INTERVAL '1 year')
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

exports.verifyResidence = async (req, res) => {
  function normalizeIP(ip) {
    
    if (!ip) return null;

    // IPv6-mapped IPv4
    if (ip.startsWith('::ffff:')) {
      return ip.replace('::ffff:', '');
    }

    return ip;
  }

  function isPrivateIP(ip) {
    return (
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.16.') ||
      ip === '127.0.0.1'
    );
  }

  try {
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
    VALUES ($1, 'residence', 3, NULL, NOW(), NOW() + INTERVAL '1 year')
    `,
    [userId]
  );

  await pool.query(
    `
    UPDATE users
    SET verification_tier = GREATEST(verification_tier, 3)
    WHERE id = $1
    `,
    [userId]
  );

  return res.json({
    success: true,
    level: 3,
    type: "residence",
    mock: true
  });
}

    // 1. Get IP
    const rawIp =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress;

    const ip = normalizeIP(rawIp);

    let score = 0;
    let country = null;
    let countryName = null;
    let devOverride = false;

    // 2. Base confidence: Tier 2 already completed
    score += 40;

    // 3. Private IP = dev environment
    if (isPrivateIP(ip)) {
      devOverride = true;
      score += 50; // enough to pass for testing
      country = "IE";
      countryName = "Ireland (dev)";
    } else {
      // 4. Public IP → Geo lookup
      const geo = await axios.get(`https://ipapi.co/${ip}/json/`);
      country = geo.data.country;
      countryName = geo.data.country_name;

      if (country === "IE") {
        score += 40;
      }

      score += 10; // mobile / ISP assumption
    }

    const verified = score >= 80;

    if (verified) {
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
        VALUES ($1, 'residence', 3, NULL,  NOW(), NOW() + INTERVAL '5 years')
        `,
        [userId]
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

    return res.json({
      verified,
      level: verified ? 3 : 2,
      score,
      ip_seen: ip,
      country,
      countryName,
      devOverride,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Residence verification failed" });
  }
};