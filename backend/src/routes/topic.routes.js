const express = require('express');
const router = express.Router();

const controller = require("../controllers/topic.controller");
const requireAuth = require("../middleware/auth.middleware");
const pool = require("../db/pool");

/* --------------------------------------------------
   Production Route
-------------------------------------------------- */

router.get("/", requireAuth, controller.getTopics);


/* ------------------------------------------------------------------------------
   Demo              What You Show                     OWASP Category

   /demo-user/:id    No object-level authorisation     A01 Broken Access Control
   /secure-user      Unsafe query concatenation        A03 Injection
   Secure versions   Proper protection                 Defensive coding
------------------------------------------------------------------------------*/


/* --------------------------------------------------
  DEMO – IDOR
-------------------------------------------------- */

//– Broken Access Control
router.get("/demo-user/:id", requireAuth, async (req, res) => {

  const userId = req.params.id;

  const result = await pool.query(
    "SELECT id, username, verification_tier FROM users WHERE id = $1",
    [userId]
  );

  res.json(result.rows[0]);
});


/* --------------------------------------------------
  SECURE VERSION – IDOR FIXED
-------------------------------------------------- */
router.get("/secure-user/:id", requireAuth, async (req, res) => {

  const userId = Number(req.params.id);

  if (req.user.id !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const result = await pool.query(
    "SELECT id, username, verification_tier FROM users WHERE id = $1",
    [userId]
  );

  res.json(result.rows[0]);
});

/* --------------------------------------------------
  DEMO – SQL Injection
-------------------------------------------------- */

// – Injection Vulnerability
router.get("/demo-search", requireAuth, async (req, res) => {

  const { title } = req.query;

  const query = `
    SELECT * FROM topics WHERE title = '${title}'
  `;

  const result = await pool.query(query);
  res.json(result.rows);
});


/* --------------------------------------------------
   SECURE VERSION – Injection FIXED
-------------------------------------------------- */

router.get("/secure-search",requireAuth, async (req, res) => {

  const { title } = req.query;

  const result = await pool.query(
    "SELECT * FROM topics WHERE title = $1",
    [title]
  );

  res.json(result.rows);
});


module.exports = router;