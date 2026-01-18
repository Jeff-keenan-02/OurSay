const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const { parse } = require('mrz');
const pool = require('../db/pool');

// ENV (move to .env later)
const CLOUD_FUNCTION_URL =
  "https://europe-west1-oursay.cloudfunctions.net/scanPassport";
const IDENTITY_SALT = "SUPPER_SECRET_REAL_SECRET_SALT";

exports.verifyPassport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = Number(req.body.userId);
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    /* --------------------------------------------------
       1. Send image to OCR Cloud Function
    -------------------------------------------------- */
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname || "passport.jpg",
      contentType: req.file.mimetype || "image/jpeg",
    });

    const cfResponse = await axios.post(CLOUD_FUNCTION_URL, form, {
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
    const mrzResult = parse(mrz_lines);
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
    const proofObject = {
      documentNumber: f.documentNumber,
      issuingCountry: f.issuingCountry,
      expiry: f.expirationDate,
    };

    const proofHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(proofObject) + IDENTITY_SALT)
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
        proof_hash,
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
      SET verification_level = GREATEST(verification_level, 2)
      WHERE id = $1
      `,
      [userId]
    );

    return res.json({
      verified: true,
      level: 2,
      type: "passport",
    });

  } catch (err) {
    console.error("Passport verification failed:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
};