const pool = require("../db/pool");

exports.getPolls = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pg.id,
        pg.title,
        t.title AS topic,
        COUNT(p.id) AS question_count,
        (
          SELECT COUNT(DISTINCT pv.token_hash)
          FROM polls p2
          JOIN poll_votes pv ON pv.poll_id = p2.id
          WHERE p2.poll_group_id = pg.id
        ) AS respondent_count
      FROM poll_groups pg
      JOIN polls p ON p.poll_group_id = pg.id
      JOIN topics t ON pg.topic_id = t.id
      GROUP BY pg.id, pg.title, t.title
      ORDER BY pg.created_at DESC
    `);

    return res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
};

exports.getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;

    const result = await pool.query(`
      SELECT 
        choice,
        COUNT(*) AS count
      FROM poll_votes
      WHERE poll_id = $1
      GROUP BY choice
    `, [pollId]);

    let yes = 0;
    let no = 0;

    result.rows.forEach(r => {
      if (r.choice === "yes") yes = Number(r.count);
      if (r.choice === "no") no = Number(r.count);
    });

    const total = yes + no;

    return res.json({
      pollId: Number(pollId),
      totalVotes: total,
      results: [
        { label: "Yes", count: yes, percentage: total ? Math.round((yes / total) * 100) : 0 },
        { label: "No", count: no, percentage: total ? Math.round((no / total) * 100) : 0 }
      ]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch poll results" });
  }
};

exports.getPollGroupResults = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Get group title + all polls in the group
    const pollsResult = await pool.query(`
      SELECT p.id, p.question
      FROM polls p
      WHERE p.poll_group_id = $1
      ORDER BY p.id ASC
    `, [groupId]);

    const groupResult = await pool.query(`
      SELECT title FROM poll_groups WHERE id = $1
    `, [groupId]);

    const groupTitle = groupResult.rows[0]?.title ?? "";

    // Fetch vote counts for each poll
    const pollsWithResults = await Promise.all(
      pollsResult.rows.map(async (poll) => {
        const votesResult = await pool.query(`
          SELECT choice, COUNT(*) AS count
          FROM poll_votes
          WHERE poll_id = $1
          GROUP BY choice
        `, [poll.id]);

        let yes = 0, no = 0;
        votesResult.rows.forEach((r) => {
          if (r.choice === "yes") yes = Number(r.count);
          if (r.choice === "no")  no  = Number(r.count);
        });
        const total = yes + no;

        return {
          pollId: poll.id,
          question: poll.question,
          totalVotes: total,
          results: [
            { label: "Yes", count: yes, percentage: total ? Math.round((yes / total) * 100) : 0 },
            { label: "No",  count: no,  percentage: total ? Math.round((no  / total) * 100) : 0 },
          ],
        };
      })
    );

    return res.json({ groupId: Number(groupId), groupTitle, polls: pollsWithResults });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch poll group analytics" });
  }
};

exports.getPetitions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.title,
        t.title AS topic,
        p.signature_goal,
        COUNT(ps.id) AS signatures
      FROM petitions p
      JOIN topics t ON p.topic_id = t.id
      LEFT JOIN petition_signatures ps ON ps.petition_id = p.id
      GROUP BY p.id, p.title, t.title, p.signature_goal
      ORDER BY p.created_at DESC
    `);

    return res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch petitions" });
  }
};

exports.getPetitionResults = async (req, res) => {
  try {
    const { petitionId } = req.params;

    // total signatures
    const result = await pool.query(`
      SELECT COUNT(*) AS count
      FROM petition_signatures
      WHERE petition_id = $1
    `, [petitionId]);

    const totalSignatures = Number(result.rows[0].count);

    // get goal
    const goalResult = await pool.query(`
      SELECT signature_goal
      FROM petitions
      WHERE id = $1
    `, [petitionId]);

    const goal = goalResult.rows[0]?.signature_goal || 0;

    const percentage = goal
      ? Math.round((totalSignatures / goal) * 100)
      : 0;

    return res.json({
      petitionId: Number(petitionId),
      totalSignatures,
      goal,
      percentage,
      remaining: Math.max(goal - totalSignatures, 0)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch petition analytics" });
  }
};