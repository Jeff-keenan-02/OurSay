DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-------------------------------------------------------------
-- Users
-------------------------------------------------------------

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  -- 0 = none, 1 = liveness, 2 = passport, 3 = residence
  verification_tier SMALLINT NOT NULL DEFAULT 0 CHECK (verification_tier BETWEEN 0 AND 3),
  created_at TIMESTAMP DEFAULT NOW()
);

--------------------------------------------------------------
-- Topics
--------------------------------------------------------------

CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  -- 'official' = platform curated, 'weekly' = this week's featured, 'community' = user created
  source TEXT NOT NULL DEFAULT 'community' CHECK (source IN ('official', 'weekly', 'community')),
  created_at TIMESTAMP DEFAULT NOW()
);

-------------------------------------------------------------
-- Polls
--------------------------------------------------------------

CREATE TABLE poll_groups (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  required_verification_tier SMALLINT NOT NULL CHECK (required_verification_tier BETWEEN 2 AND 3),
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE polls (
  id SERIAL PRIMARY KEY,
  poll_group_id INTEGER NOT NULL REFERENCES poll_groups(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-------------------------------------------------------------
-- Petitions
--------------------------------------------------------------

--  PETITIONS (REQUIRES VERIFICATION)
CREATE TABLE petitions (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_verification_tier SMALLINT NOT NULL CHECK (required_verification_tier BETWEEN 2 AND 3),

  -- petition progress (global)
  signature_goal INT NOT NULL CHECK (signature_goal > 0),
  created_at TIMESTAMP DEFAULT NOW()
);


-------------------------------------------------------------
-- Discussions
--------------------------------------------------------------

CREATE TABLE discussions (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,

  -- snapshot of user's verification at time of comment
  verification_tier SMALLINT NOT NULL CHECK (verification_tier BETWEEN 0 AND 3),
  created_at TIMESTAMP DEFAULT NOW()
);



-------------------------------------------------------------
-- Ui progress for petitions and polls 
--------------------------------------------------------------

-- for UI user_id is stored to upvote or downvote
CREATE TABLE discussion_votes (
  discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (discussion_id, user_id)
);

-- for ui progress bar
CREATE TABLE poll_participation (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  participated_at DATE DEFAULT CURRENT_DATE,
  PRIMARY KEY (user_id, poll_id)
);


-- for ui progress 
CREATE TABLE petition_participation (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  petition_id INTEGER NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  participated_at DATE DEFAULT CURRENT_DATE,
  PRIMARY KEY (user_id, petition_id)
);


-------------------------------------------------------------
-- Verification
-------------------------------------------------------------

CREATE TYPE verification_type AS ENUM (
  'liveness',
  'passport',
  'residence'
);

CREATE TABLE verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type verification_type NOT NULL,

  -- highest level granted by this verification
  level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 3),

  -- irreversible hash of document signal
  passport_hash TEXT,
  issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE,

  -- passport must include proof hash
  CONSTRAINT passport_requires_hash
    CHECK (
      (type = 'passport' AND passport_hash IS NOT NULL)
      OR
      (type != 'passport' AND passport_hash IS NULL)
    )
);


-- global protecetion of reused passport
CREATE UNIQUE INDEX unique_active_passport_hash
ON verifications (passport_hash)
WHERE type = 'passport' AND revoked = false;


-------------------------------------------------------------
-- Voting
-------------------------------------------------------------

-- insure that the passport was not used on the poll already
CREATE TABLE poll_identity_usage (
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  passport_hash TEXT NOT NULL,
  PRIMARY KEY (poll_id, passport_hash)
);

-- insure that the passport was not used on the petition already
CREATE TABLE petition_identity_usage (
  petition_id INTEGER NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  passport_hash TEXT NOT NULL,
  PRIMARY KEY (petition_id, passport_hash)
);


-- Stores randomly generated token to vote
CREATE TABLE action_tokens (
  token_hash TEXT PRIMARY KEY,
  action_type TEXT NOT NULL CHECK (
    action_type IN ('poll_vote', 'petition_sign')
  ),

  poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
  petition_id INTEGER REFERENCES petitions(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,

  -- Exactly ONE target must be set
  CHECK (
    (action_type = 'poll_vote' AND poll_id IS NOT NULL AND petition_id IS NULL)
    OR
    (action_type = 'petition_sign' AND petition_id IS NOT NULL AND poll_id IS NULL)
  )
);


-- store the randomly gerated token with a petition  
CREATE TABLE petition_signatures (
  id SERIAL PRIMARY KEY,
  petition_id INTEGER NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL REFERENCES action_tokens(token_hash) ON DELETE CASCADE,
  created_at DATE DEFAULT CURRENT_DATE,

  UNIQUE (petition_id, token_hash)
);

-- store the randomly gerated token with a poll and their choice
CREATE TABLE poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL REFERENCES action_tokens(token_hash) ON DELETE CASCADE,
  choice VARCHAR(10) NOT NULL CHECK (choice IN ('yes', 'no')),
  created_at DATE DEFAULT CURRENT_DATE,
  UNIQUE (poll_id, token_hash)
);









INSERT INTO users (username, password_hash, verification_tier)
VALUES
('hell', 'hash1', 2),
('bob', 'hash2', 1),
('charlie', 'hash3', 0);


INSERT INTO topics (title, description, source)
VALUES
('Housing & Cost of Living', 'Rent, mortgages, affordability', 'official'),
('Transport & Infrastructure', 'Public transport, roads, cycling', 'official'),
('Healthcare & Wellbeing', 'Hospitals, mental health, services', 'official'),
('Climate & Environment', 'Climate action and sustainability', 'official'),
('Education', 'Schools, universities, student life', 'official'),
('Technology & Society', 'AI, privacy, digital rights', 'official'),
('Weekly Public Opinion', 'This weeks featured national topic', 'weekly'),
('Community & Local Issues', 'Local civic matters and grassroots discussions', 'community');

INSERT INTO poll_groups (topic_id, title, required_verification_tier)
VALUES
-- Housing
(1, 'Housing Affordability Survey', 2),
(1, 'Rent Controls Policy Survey', 2),

-- Transport
(2, 'Public Transport Accessibility Survey', 2),

-- Healthcare
(3, 'Healthcare System Capacity Survey', 2),

-- Climate
(4, 'Climate Policy Survey', 3),

-- Education
(5, 'Education Reform Survey', 2),

-- Technology
(6, 'AI & Privacy Survey', 2),

-- Weekly topic
(7, 'This Weeks National Opinion', 3);


INSERT INTO polls (poll_group_id, question, description)
VALUES

-- Housing Affordability
((SELECT id FROM poll_groups WHERE title = 'Housing Affordability Survey'),
 'Is rent too high?',
 'General perception of rent levels'),

((SELECT id FROM poll_groups WHERE title = 'Housing Affordability Survey'),
 'Is home ownership affordable?',
 'Ability to purchase a home'),

-- Rent Controls
((SELECT id FROM poll_groups WHERE title = 'Rent Controls Policy Survey'),
 'Should rent caps exist?',
 'Support for rent controls'),

-- Transport
((SELECT id FROM poll_groups WHERE title = 'Public Transport Accessibility Survey'),
 'Should public transport be free?',
 'Opinion on free transport'),

-- Climate
((SELECT id FROM poll_groups WHERE title = 'Climate Policy Survey'),
 'Should carbon tax increase?',
 'Climate funding question'),

-- Education
((SELECT id FROM poll_groups WHERE title = 'Education Reform Survey'),
 'Should college fees be reduced?',
 'Higher education affordability'),

-- Technology
((SELECT id FROM poll_groups WHERE title = 'AI & Privacy Survey'),
 'Should AI be regulated?',
 'Digital governance'),

-- Weekly
((SELECT id FROM poll_groups WHERE title = 'This Weeks National Opinion'),
 'Should housing supply be increased?', 'National housing policy');


-- create some petitions
INSERT INTO petitions (topic_id, title, description, required_verification_tier, signature_goal)
VALUES
(1, 'Introduce stronger rent controls', 'Limit annual rent increases nationwide',2, 1000),
(4, 'Increase climate action funding','Commit additional funding to climate initiatives',3, 5000);

-- Create Weeeky petition
INSERT INTO petitions (topic_id, title, description, required_verification_tier, signature_goal)
VALUES (7, 'Ban Short-Term Rentals', 'Reduce housing pressure', 2, 1000);


INSERT INTO discussions (topic_id, title, body, created_by)
VALUES
(1, 'Should vacant properties be taxed?', 'Many properties sit empty while rents rise. Should there be penalties?',2),
(2, 'Free public transport — good idea?','Would this reduce congestion or strain the system?',1),
(4, 'Is Ireland doing enough on climate change?','Targets exist, but are we actually meeting them?',3),
(6, 'Should AI be regulated more strictly?','Concerns about surveillance and job displacement.',1),
(7,'Should Ireland introduce 4-day work weeks?','What are the economic and social impacts of moving to a 4-day working model?',1);




INSERT INTO comments ( discussion_id, user_id, body, verification_tier)
VALUES
(1, 1, 'Absolutely agree — it''s a huge issue.', 2),
(1, 3, 'Taxing them might push owners to sell or rent.', 0),
(2, 2, 'Free transport works in other countries.', 1),
(2, 1, 'But funding has to come from somewhere.', 2),
(3, 3, 'Climate action is overdue.', 0),
(4, 2, 'Regulation is inevitable at this point.', 1);

INSERT INTO discussion_votes (discussion_id, user_id, value)
VALUES
(1, 1, 1),
(1, 3, 1),
(2, 1, 1),
(2, 3, -1),
(3, 2, 1),
(4, 1, 1);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH new_tokens AS (
  INSERT INTO action_tokens (
    token_hash,
    action_type,
    petition_id,
    expires_at,
    used
  )
  SELECT
    encode(gen_random_bytes(32), 'hex'),
    'petition_sign',
    1,
    NOW() + INTERVAL '10 years',
    true
  FROM generate_series(1, 420)
  RETURNING token_hash
)
INSERT INTO petition_signatures (petition_id, token_hash)
SELECT 1, token_hash
FROM new_tokens;

WITH new_tokens AS (
  INSERT INTO action_tokens (
    token_hash,
    action_type,
    petition_id,
    expires_at,
    used
  )
  SELECT
    encode(gen_random_bytes(32), 'hex'),
    'petition_sign',
    2,
    NOW() + INTERVAL '10 years',
    true
  FROM generate_series(1, 3200)
  RETURNING token_hash
)
INSERT INTO petition_signatures (petition_id, token_hash)
SELECT 2, token_hash
FROM new_tokens;

WITH new_tokens AS (
  INSERT INTO action_tokens (
    token_hash,
    action_type,
    petition_id,
    expires_at,
    used
  )
  SELECT
    encode(gen_random_bytes(32), 'hex'),
    'petition_sign',
    3,
    NOW() + INTERVAL '10 years',
    true
  FROM generate_series(1, 860)
  RETURNING token_hash
)
INSERT INTO petition_signatures (petition_id, token_hash)
SELECT 3, token_hash
FROM new_tokens;

