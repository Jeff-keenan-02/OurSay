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
('hell',    'hash1', 3),
('bob',     'hash2', 2),
('charlie', 'hash3', 1),
('aoife',   'hash4', 2),
('sean',    'hash5', 3),
('niamh',   'hash6', 1),
('conor',   'hash7', 2);


INSERT INTO topics (title, description, source)
VALUES
('Housing & Cost of Living',   'Rent, mortgages, social housing, and affordability across Ireland',          'official'),
('Transport & Infrastructure', 'Public transport, roads, cycling infrastructure, and rural connectivity',    'official'),
('Healthcare & Wellbeing',     'Hospital waiting lists, mental health services, GP access, and social care', 'official'),
('Climate & Environment',      'Climate action, renewable energy, biodiversity, and sustainability targets',  'official'),
('Education',                  'Schools, third-level fees, special needs provision, and teacher shortages',  'official'),
('Technology & Society',       'AI regulation, data privacy, digital rights, and online safety',             'official'),
('Weekly Public Opinion',      'This week''s featured national topic — updated every Monday',                'weekly'),
('Community & Local Issues',   'Local planning, grassroots campaigns, and neighbourhood issues',             'community');

INSERT INTO poll_groups (topic_id, title, required_verification_tier)
VALUES
-- Housing (topic 1) — 5 groups
(1, 'Housing Affordability Survey',              2),  -- 5 questions
(1, 'Rent Controls & Landlord Policy',           2),  -- 4 questions
(1, 'Social Housing & Homelessness',             3),  -- 3 questions
(1, 'Investment Funds & Build-to-Rent',          3),  -- 2 questions
(1, 'Planning Reform & Housing Supply',          2),  -- 1 question

-- Transport (topic 2) — 4 groups
(2, 'Public Transport Investment Survey',        2),  -- 4 questions
(2, 'Active Travel & Cycling Policy',            2),  -- 3 questions
(2, 'Rural Connectivity Survey',                 2),  -- 2 questions
(2, 'Electric Vehicle & Charging Infrastructure',2),  -- 1 question

-- Healthcare (topic 3) — 4 groups
(3, 'Healthcare Waiting Lists Survey',           2),  -- 5 questions
(3, 'Mental Health Services Survey',             2),  -- 3 questions
(3, 'GP Access & Primary Care',                  2),  -- 4 questions
(3, 'Elderly Care & Nursing Homes',              3),  -- 2 questions

-- Climate (topic 4) — 4 groups
(4, 'Climate Targets & Accountability',          3),  -- 4 questions
(4, 'Renewable Energy Transition Survey',        2),  -- 3 questions
(4, 'Agriculture & Land Use Emissions',          3),  -- 2 questions
(4, 'Biodiversity & Nature Emergency',           2),  -- 1 question

-- Education (topic 5) — 4 groups
(5, 'Third-Level Fees & Access Survey',          2),  -- 4 questions
(5, 'School Funding & Resources Survey',         2),  -- 3 questions
(5, 'Special Needs Education Survey',            2),  -- 4 questions
(5, 'Teacher Shortages & Pay Survey',            2),  -- 2 questions

-- Technology (topic 6) — 4 groups
(6, 'AI Regulation & Governance Survey',         2),  -- 4 questions
(6, 'Data Privacy & Online Rights Survey',       2),  -- 3 questions
(6, 'Social Media & Online Harm Survey',         2),  -- 4 questions
(6, 'Digital Government & Public Services',      2),  -- 2 questions

-- Weekly (topic 7) — 1 group
(7, 'This Week: Cost of Living Crisis',          3);  -- 3 questions


INSERT INTO polls (poll_group_id, question, description)
VALUES

-- ── HOUSING ─────────────────────────────────────────────────────────────────

-- Housing Affordability Survey (5 questions)
((SELECT id FROM poll_groups WHERE title = 'Housing Affordability Survey'),
 'Is renting in Ireland unaffordable for most people?',
 'Average rent nationally now exceeds €1,800/month. Do you consider this unaffordable for the majority of renters?'),
((SELECT id FROM poll_groups WHERE title = 'Housing Affordability Survey'),
 'Is home ownership a realistic goal for someone in their 30s today?',
 'With average house prices over €300,000 in many cities, do you believe purchasing a home is achievable for a typical working adult?'),
((SELECT id FROM poll_groups WHERE title = 'Housing Affordability Survey'),
 'Should the government prioritise building homes over other infrastructure spending?',
 'Given the scale of the housing crisis, should housing construction take precedence in the national budget?'),
((SELECT id FROM poll_groups WHERE title = 'Housing Affordability Survey'),
 'Is the Help-to-Buy scheme benefiting first-time buyers or inflating prices?',
 'Critics argue the scheme increases demand without increasing supply, pushing prices higher. Do you think it helps or harms affordability?'),
((SELECT id FROM poll_groups WHERE title = 'Housing Affordability Survey'),
 'Should there be a legal maximum on what proportion of income someone can be required to pay in rent?',
 'Several countries set rent-to-income ratios as part of tenancy law. Should Ireland introduce a cap — for example, no more than 30% of net income?'),

-- Rent Controls & Landlord Policy (4 questions)
((SELECT id FROM poll_groups WHERE title = 'Rent Controls & Landlord Policy'),
 'Should there be a national cap on annual rent increases?',
 'Some counties have Rent Pressure Zones limiting increases to 2%. Should this apply everywhere in Ireland?'),
((SELECT id FROM poll_groups WHERE title = 'Rent Controls & Landlord Policy'),
 'Should landlords who leave properties vacant face financial penalties?',
 'Thousands of properties sit empty while the rental market is under severe pressure. Should vacancy taxes be enforced more strictly?'),
((SELECT id FROM poll_groups WHERE title = 'Rent Controls & Landlord Policy'),
 'Should landlords be required to provide a minimum 5-year lease to tenants?',
 'Short tenancy terms contribute to housing instability. Would mandating longer leases help renters?'),
((SELECT id FROM poll_groups WHERE title = 'Rent Controls & Landlord Policy'),
 'Should landlords be required to register all rental properties on a public national database?',
 'A public register would allow rent comparisons and enforcement of price caps. Should this be mandatory?'),

-- Social Housing & Homelessness (3 questions)
((SELECT id FROM poll_groups WHERE title = 'Social Housing & Homelessness'),
 'Is the current pace of social housing construction fast enough to address homelessness?',
 'Homelessness figures remain at record highs. Does the government''s social housing delivery rate match the scale of need?'),
((SELECT id FROM poll_groups WHERE title = 'Social Housing & Homelessness'),
 'Should approved housing bodies (AHBs) receive more state funding to build social homes?',
 'AHBs deliver a large share of social housing. Should they receive significantly increased capital investment?'),
((SELECT id FROM poll_groups WHERE title = 'Social Housing & Homelessness'),
 'Should families in emergency accommodation for more than 6 months be guaranteed a permanent tenancy?',
 'Many families spend years in hotels and B&Bs. Should there be a legal time limit after which the state must provide permanent housing?'),

-- Investment Funds & Build-to-Rent (2 questions)
((SELECT id FROM poll_groups WHERE title = 'Investment Funds & Build-to-Rent'),
 'Should institutional investors (e.g. REITs and investment funds) be banned from bulk-buying residential properties?',
 'Large funds have purchased entire estates and apartment blocks, reducing supply for owner-occupiers. Should this practice be prohibited?'),
((SELECT id FROM poll_groups WHERE title = 'Investment Funds & Build-to-Rent'),
 'Should build-to-rent developments be subject to the same affordability requirements as other new housing?',
 'Current planning rules allow build-to-rent schemes to bypass some social and affordable housing obligations. Should these exemptions end?'),

-- Planning Reform & Housing Supply (1 question)
((SELECT id FROM poll_groups WHERE title = 'Planning Reform & Housing Supply'),
 'Should Ireland reform its planning system to reduce delays and objections for housing developments?',
 'Planning objections and legal challenges can delay housing projects by years. Should the system be reformed to prioritise housing delivery over appeals?'),

-- ── TRANSPORT ────────────────────────────────────────────────────────────────

-- Public Transport Investment Survey (4 questions)
((SELECT id FROM poll_groups WHERE title = 'Public Transport Investment Survey'),
 'Should public transport in Irish cities be made free at the point of use?',
 'Several European cities have introduced free public transit. Could this work for Dublin, Cork, or Galway?'),
((SELECT id FROM poll_groups WHERE title = 'Public Transport Investment Survey'),
 'Is the current level of investment in rural public transport adequate?',
 'Many rural communities have no reliable bus or rail service. Is the government doing enough to connect them?'),
((SELECT id FROM poll_groups WHERE title = 'Public Transport Investment Survey'),
 'Should a new metro line for Dublin be prioritised over other transport projects?',
 'MetroLink has been planned and delayed for decades. Should it be the top transport infrastructure priority?'),
((SELECT id FROM poll_groups WHERE title = 'Public Transport Investment Survey'),
 'Should intercity rail between Dublin, Cork, Limerick, and Galway be electrified within 10 years?',
 'Ireland''s intercity rail network still runs on diesel. Should electrification of main lines be a national infrastructure priority?'),

-- Active Travel & Cycling Policy (3 questions)
((SELECT id FROM poll_groups WHERE title = 'Active Travel & Cycling Policy'),
 'Should more road space be reallocated to protected cycling lanes?',
 'Protected cycle lanes often require removing car lanes or parking. Is this a worthwhile trade-off?'),
((SELECT id FROM poll_groups WHERE title = 'Active Travel & Cycling Policy'),
 'Should e-scooters be legally permitted on Irish roads and cycle paths?',
 'E-scooters are widely used across Europe but remain in a legal grey area in Ireland. Should they be regulated and allowed?'),
((SELECT id FROM poll_groups WHERE title = 'Active Travel & Cycling Policy'),
 'Should the government fund free bike-share schemes in all Irish cities with a population over 50,000?',
 'Dublin Bikes has been successful in the capital. Should similar schemes be publicly funded and rolled out nationally?'),

-- Rural Connectivity Survey (2 questions)
((SELECT id FROM poll_groups WHERE title = 'Rural Connectivity Survey'),
 'Is rural Ireland adequately connected to the national broadband network?',
 'The National Broadband Plan has faced repeated delays. Do you believe rural communities currently have acceptable digital connectivity?'),
((SELECT id FROM poll_groups WHERE title = 'Rural Connectivity Survey'),
 'Should rural communities have legally guaranteed minimum levels of public transport service?',
 'Some rural areas have no bus service at all. Should the state be legally required to provide a minimum weekly service to every townland?'),

-- Electric Vehicle & Charging Infrastructure (1 question)
((SELECT id FROM poll_groups WHERE title = 'Electric Vehicle & Charging Infrastructure'),
 'Is Ireland''s public EV charging network adequate for a transition away from petrol and diesel cars?',
 'Ireland has committed to 945,000 EVs on the road by 2030. The current public charging network is widely considered insufficient. Do you agree it needs urgent expansion?'),

-- ── HEALTHCARE ───────────────────────────────────────────────────────────────

-- Healthcare Waiting Lists Survey (5 questions)
((SELECT id FROM poll_groups WHERE title = 'Healthcare Waiting Lists Survey'),
 'Is the length of outpatient waiting lists in Ireland acceptable?',
 'Over 900,000 people are currently on outpatient waiting lists. Do you find this level of delay acceptable?'),
((SELECT id FROM poll_groups WHERE title = 'Healthcare Waiting Lists Survey'),
 'Should private health insurance give you faster access to public hospital care?',
 'Critics argue the current two-tier system means private patients get faster treatment in publicly funded hospitals. Is this fair?'),
((SELECT id FROM poll_groups WHERE title = 'Healthcare Waiting Lists Survey'),
 'Should GPs in Ireland be free to visit for everyone, not just medical card holders?',
 'Ireland is one of few countries where primary care is not free for all. Should universal free GP care be introduced?'),
((SELECT id FROM poll_groups WHERE title = 'Healthcare Waiting Lists Survey'),
 'Should the government publish a legally binding waiting list reduction target with quarterly accountability reports?',
 'Currently there is no legal obligation on the HSE to reduce waiting lists by a specific date. Should this change?'),
((SELECT id FROM poll_groups WHERE title = 'Healthcare Waiting Lists Survey'),
 'Should consultants in public hospitals be prohibited from also working in private practice?',
 'Many argue the dual practice model creates incentives that slow public patient care. Should consultants choose one or the other?'),

-- Mental Health Services Survey (3 questions)
((SELECT id FROM poll_groups WHERE title = 'Mental Health Services Survey'),
 'Is mental health given the same priority as physical health in Ireland''s health system?',
 'Despite Sláintecare commitments, many argue mental health services remain chronically underfunded. Do you agree?'),
((SELECT id FROM poll_groups WHERE title = 'Mental Health Services Survey'),
 'Should CAMHS (Child and Adolescent Mental Health Services) receive emergency additional funding?',
 'Thousands of children and teenagers are waiting over a year for first appointments. Does this constitute a crisis requiring emergency investment?'),
((SELECT id FROM poll_groups WHERE title = 'Mental Health Services Survey'),
 'Should counselling and psychotherapy be available free of charge through the public health system?',
 'Currently most people must pay privately for talk therapy. Should the HSE fund free counselling for all who need it?'),

-- GP Access & Primary Care (4 questions)
((SELECT id FROM poll_groups WHERE title = 'GP Access & Primary Care'),
 'Is it too difficult to register with a GP in Ireland?',
 'Many practices have closed their lists. Is finding and registering with a GP a significant barrier to healthcare access?'),
((SELECT id FROM poll_groups WHERE title = 'GP Access & Primary Care'),
 'Should pharmacists be given extended prescribing rights to reduce pressure on GPs?',
 'In several countries, pharmacists can prescribe for common conditions. Would this help manage GP demand in Ireland?'),
((SELECT id FROM poll_groups WHERE title = 'GP Access & Primary Care'),
 'Should GPs be employed directly by the HSE rather than operating as independent contractors?',
 'The current model means GPs set their own fees and hours. Would HSE employment improve access and consistency of care?'),
((SELECT id FROM poll_groups WHERE title = 'GP Access & Primary Care'),
 'Should out-of-hours GP services be significantly expanded to reduce A&E overcrowding?',
 'A&E departments are frequently used for non-emergency conditions because GP access is limited outside office hours. Should this be addressed?'),

-- Elderly Care & Nursing Homes (2 questions)
((SELECT id FROM poll_groups WHERE title = 'Elderly Care & Nursing Homes'),
 'Is the Fair Deal scheme providing adequate financial protection for people entering nursing home care?',
 'The Fair Deal scheme can require people to contribute up to 7.5% of the value of their home annually. Do you think this is equitable?'),
((SELECT id FROM poll_groups WHERE title = 'Elderly Care & Nursing Homes'),
 'Should more investment go into home care packages to allow elderly people to stay in their own homes longer?',
 'Many older people prefer to stay at home with support rather than enter residential care. Is current home care funding sufficient?'),

-- ── CLIMATE ──────────────────────────────────────────────────────────────────

-- Climate Targets & Accountability (4 questions)
((SELECT id FROM poll_groups WHERE title = 'Climate Targets & Accountability'),
 'Is Ireland on track to meet its 2030 emissions reduction targets?',
 'Ireland has committed to a 51% reduction in emissions by 2030. Based on current progress, do you believe this is achievable?'),
((SELECT id FROM poll_groups WHERE title = 'Climate Targets & Accountability'),
 'Should politicians who vote against climate legislation face electoral accountability measures?',
 'Some advocate for voters having a formal mechanism to hold elected representatives accountable for climate votes. Do you support this?'),
((SELECT id FROM poll_groups WHERE title = 'Climate Targets & Accountability'),
 'Should Ireland introduce a citizens'' assembly recommendation on climate with binding referendum powers?',
 'The existing Climate Assembly made recommendations. Should future assemblies have the power to trigger binding referenda?'),
((SELECT id FROM poll_groups WHERE title = 'Climate Targets & Accountability'),
 'Should Ireland pay climate reparations to countries most affected by emissions it has historically produced?',
 'Wealthier nations have contributed disproportionately to global emissions. Should Ireland contribute to a global climate loss and damage fund?'),

-- Renewable Energy Transition Survey (3 questions)
((SELECT id FROM poll_groups WHERE title = 'Renewable Energy Transition Survey'),
 'Should planning restrictions on wind farms in Ireland be relaxed to accelerate renewable energy?',
 'Ireland has significant wind energy potential but planning objections slow development. Should planning be fast-tracked?'),
((SELECT id FROM poll_groups WHERE title = 'Renewable Energy Transition Survey'),
 'Should homeowners receive stronger financial incentives to install solar panels?',
 'Grants and feed-in tariffs exist but uptake is slow. Should the government significantly increase financial support for home solar?'),
((SELECT id FROM poll_groups WHERE title = 'Renewable Energy Transition Survey'),
 'Should offshore wind energy revenues be ring-fenced into a sovereign wealth fund for future generations?',
 'Ireland has significant offshore wind potential. Should profits from this national resource be preserved in a public fund rather than spent on current budgets?'),

-- Agriculture & Land Use Emissions (2 questions)
((SELECT id FROM poll_groups WHERE title = 'Agriculture & Land Use Emissions'),
 'Should Irish farmers face legally binding emissions reduction targets?',
 'Agriculture accounts for 38% of Irish emissions. Should individual farm operations be subject to mandatory emissions caps?'),
((SELECT id FROM poll_groups WHERE title = 'Agriculture & Land Use Emissions'),
 'Should the government pay farmers to rewet bogs and restore peatlands as a climate measure?',
 'Restored peatlands are significant carbon sinks. Should the state fund large-scale rewetting programmes with direct payments to landowners?'),

-- Biodiversity & Nature Emergency (1 question)
((SELECT id FROM poll_groups WHERE title = 'Biodiversity & Nature Emergency'),
 'Should Ireland declare a formal biodiversity emergency alongside its climate emergency declaration?',
 'Ireland has one of the lowest proportions of protected land in the EU and has seen significant species decline. Should biodiversity loss be treated with the same urgency as climate change?'),

-- ── EDUCATION ────────────────────────────────────────────────────────────────

-- Third-Level Fees & Access Survey (4 questions)
((SELECT id FROM poll_groups WHERE title = 'Third-Level Fees & Access Survey'),
 'Should third-level student fees in Ireland be abolished entirely?',
 'The current student contribution charge is €3,000 per year. Should this be eliminated and replaced with state funding?'),
((SELECT id FROM poll_groups WHERE title = 'Third-Level Fees & Access Survey'),
 'Is the current student grant (SUSI) sufficient to cover the cost of living while studying?',
 'With rents near campuses now exceeding €1,000/month, does the SUSI grant adequately support students from lower-income backgrounds?'),
((SELECT id FROM poll_groups WHERE title = 'Third-Level Fees & Access Survey'),
 'Should postgraduate fees be fully subsidised by the state?',
 'Postgraduate education often costs €5,000–€15,000 per year. Should state funding extend beyond undergraduate level?'),
((SELECT id FROM poll_groups WHERE title = 'Third-Level Fees & Access Survey'),
 'Should universities be required to ring-fence a percentage of places for students from disadvantaged backgrounds?',
 'DARE and HEAR schemes exist but participation rates remain low. Should quotas be introduced to ensure access for under-represented groups?'),

-- School Funding & Resources Survey (3 questions)
((SELECT id FROM poll_groups WHERE title = 'School Funding & Resources Survey'),
 'Are Irish primary schools adequately resourced to support children with additional learning needs?',
 'SNA and resource teacher allocations have been criticised as insufficient. Do you believe schools have what they need to support all pupils?'),
((SELECT id FROM poll_groups WHERE title = 'School Funding & Resources Survey'),
 'Should the state fully fund all school building costs, removing reliance on parental fundraising?',
 'Many Irish schools rely on annual fundraising to cover basic costs. Should all capital and maintenance funding come directly from the state?'),
((SELECT id FROM poll_groups WHERE title = 'School Funding & Resources Survey'),
 'Should hot school meals be provided free to all primary school children?',
 'A pilot hot school meals programme exists in DEIS schools. Should this be extended to all primary schools nationally?'),

-- Special Needs Education Survey (4 questions)
((SELECT id FROM poll_groups WHERE title = 'Special Needs Education Survey'),
 'Is the process for applying for SNA (Special Needs Assistant) support adequate for families?',
 'Many families report the application process as lengthy, opaque, and adversarial. Do you believe it works as it should?'),
((SELECT id FROM poll_groups WHERE title = 'Special Needs Education Survey'),
 'Should there be a legal right to an SNA allocation for children assessed as requiring one?',
 'Currently allocation is at NCSE discretion. Should children with professional assessments recommending SNA support have a legal entitlement?'),
((SELECT id FROM poll_groups WHERE title = 'Special Needs Education Survey'),
 'Are there enough special school places in Ireland for children who need them?',
 'Hundreds of children with complex needs are without school placements each year. Is the state meeting its obligation to provide education for all?'),
((SELECT id FROM poll_groups WHERE title = 'Special Needs Education Survey'),
 'Should all newly qualified teachers be required to complete a module in inclusive and special needs education?',
 'Many teachers report feeling underprepared to support pupils with additional needs. Should inclusive education be a mandatory part of all teacher training?'),

-- Teacher Shortages & Pay Survey (2 questions)
((SELECT id FROM poll_groups WHERE title = 'Teacher Shortages & Pay Survey'),
 'Is the current pay and conditions package sufficient to attract and retain teachers in Ireland?',
 'Ireland faces significant teacher shortages, particularly in STEM and special education. Do you believe pay and conditions are competitive enough?'),
((SELECT id FROM poll_groups WHERE title = 'Teacher Shortages & Pay Survey'),
 'Should newly qualified teachers receive a housing support payment given the cost of living near schools in urban areas?',
 'Many NQTs cannot afford to live near the schools where they are placed. Should a targeted housing support be introduced for teachers in high-cost areas?'),

-- ── TECHNOLOGY ───────────────────────────────────────────────────────────────

-- AI Regulation & Governance Survey (4 questions)
((SELECT id FROM poll_groups WHERE title = 'AI Regulation & Governance Survey'),
 'Should the use of AI in public sector decision-making (e.g. welfare, policing) be strictly regulated?',
 'AI is increasingly used to assist decisions in housing allocations, benefits assessments, and other public services. Should this be subject to independent oversight?'),
((SELECT id FROM poll_groups WHERE title = 'AI Regulation & Governance Survey'),
 'Should generative AI companies be required to disclose the training data they use?',
 'Concerns exist about AI systems trained on copyrighted or personal data without consent. Should disclosure be legally mandated?'),
((SELECT id FROM poll_groups WHERE title = 'AI Regulation & Governance Survey'),
 'Do you think AI will have a net positive impact on Irish employment over the next decade?',
 'Economists are divided on whether AI will create more jobs than it displaces. What is your view on its likely effect on Irish workers?'),
((SELECT id FROM poll_groups WHERE title = 'AI Regulation & Governance Survey'),
 'Should there be a national AI ethics board with powers to audit public and private AI deployments?',
 'Several countries have established AI oversight bodies. Should Ireland establish an independent board with real investigatory and sanctioning powers?'),

-- Data Privacy & Online Rights Survey (3 questions)
((SELECT id FROM poll_groups WHERE title = 'Data Privacy & Online Rights Survey'),
 'Is Ireland doing enough to enforce GDPR against large tech companies?',
 'Ireland is the EU''s lead regulator for many major tech firms. Critics argue enforcement has been too slow and fines too small. Do you agree?'),
((SELECT id FROM poll_groups WHERE title = 'Data Privacy & Online Rights Survey'),
 'Should children under 16 be banned from social media platforms?',
 'Several countries are moving towards age restrictions on platforms like TikTok and Instagram. Should Ireland introduce a hard age limit?'),
((SELECT id FROM poll_groups WHERE title = 'Data Privacy & Online Rights Survey'),
 'Should every citizen have the right to download all data held about them by any company operating in Ireland?',
 'GDPR gives a right of access but enforcement is inconsistent. Should this right be strengthened with a mandatory 30-day delivery requirement?'),

-- Social Media & Online Harm Survey (4 questions)
((SELECT id FROM poll_groups WHERE title = 'Social Media & Online Harm Survey'),
 'Should social media platforms be legally liable for harmful content left up after being reported?',
 'Currently platforms face limited liability for user-generated content. Should liability attach once a company has been notified of harmful material and failed to act?'),
((SELECT id FROM poll_groups WHERE title = 'Social Media & Online Harm Survey'),
 'Should algorithmic recommendation systems (e.g. TikTok For You, YouTube autoplay) be regulated?',
 'Recommendation algorithms are designed to maximise engagement, not wellbeing. Should their design be subject to independent safety audits?'),
((SELECT id FROM poll_groups WHERE title = 'Social Media & Online Harm Survey'),
 'Should online anonymity be restricted to reduce harassment and disinformation?',
 'Some argue anonymous accounts enable abuse and spread of misinformation. Others argue anonymity protects legitimate speech and whistleblowers. Where do you stand?'),
((SELECT id FROM poll_groups WHERE title = 'Social Media & Online Harm Survey'),
 'Should platforms be required to provide a chronological feed option with no algorithmic ranking?',
 'Many users want to see posts in time order without personalisation. Should platforms be legally required to offer this as a default option?'),

-- Digital Government & Public Services (2 questions)
((SELECT id FROM poll_groups WHERE title = 'Digital Government & Public Services'),
 'Should all government services in Ireland be fully accessible online without requiring in-person attendance?',
 'Many state services still require physical presence or paper forms. Should full digital access be a legal requirement for all public services?'),
((SELECT id FROM poll_groups WHERE title = 'Digital Government & Public Services'),
 'Should Ireland introduce a secure digital identity system for accessing public services?',
 'Many EU countries use national digital IDs. Should Ireland introduce an opt-in digital identity card linked to government services?'),

-- ── WEEKLY ───────────────────────────────────────────────────────────────────

-- This Week: Cost of Living Crisis (3 questions)
((SELECT id FROM poll_groups WHERE title = 'This Week: Cost of Living Crisis'),
 'Is the government doing enough to address the cost of living crisis?',
 'Energy costs, food prices, and rents have all risen sharply. Do you think current government measures are adequate?'),
((SELECT id FROM poll_groups WHERE title = 'This Week: Cost of Living Crisis'),
 'Should energy companies be subject to a windfall tax on excess profits?',
 'Several energy firms reported record profits during the cost of living surge. Should those profits be taxed and redistributed to households?'),
((SELECT id FROM poll_groups WHERE title = 'This Week: Cost of Living Crisis'),
 'Should the minimum wage be increased to €15 per hour immediately?',
 'The current minimum wage is €12.70. Trade unions and living wage campaigners argue €15 is needed now to reflect the real cost of living.');


CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Pre-seed poll participation + votes for user 'hell' (id=1, tier 3)
-- This gives a mix of Completed / In Progress / Not Started groups in the filter
-- Groups fully completed: Housing Affordability (5q), Rent Controls (4q), Social Housing (3q)
-- Group in progress: Public Transport Investment (answered 2 of 4)
-- All others: Not Started

DO $$
DECLARE
  poll_ids INT[];
  tok TEXT;
  i INT;
  choice TEXT;
BEGIN
  -- Collect all poll IDs for groups we want fully completed
  SELECT array_agg(p.id ORDER BY p.id) INTO poll_ids
  FROM polls p
  JOIN poll_groups pg ON pg.id = p.poll_group_id
  WHERE pg.title IN (
    'Housing Affordability Survey',
    'Rent Controls & Landlord Policy',
    'Social Housing & Homelessness',
    'Mental Health Services Survey',
    'Biodiversity & Nature Emergency',
    'Teacher Shortages & Pay Survey',
    'Digital Government & Public Services'
  );

  FOREACH i IN ARRAY poll_ids LOOP
    choice := CASE WHEN (i % 3 = 0) THEN 'no' ELSE 'yes' END;
    tok := encode(gen_random_bytes(32), 'hex');
    INSERT INTO action_tokens (token_hash, action_type, poll_id, expires_at, used)
      VALUES (tok, 'poll_vote', i, NOW() + INTERVAL '10 years', true);
    INSERT INTO poll_votes (poll_id, token_hash, choice) VALUES (i, tok, choice);
    INSERT INTO poll_participation (user_id, poll_id) VALUES (1, i);
  END LOOP;

  -- In-progress: first 2 polls of 'Public Transport Investment Survey'
  SELECT array_agg(p.id ORDER BY p.id) INTO poll_ids
  FROM polls p
  JOIN poll_groups pg ON pg.id = p.poll_group_id
  WHERE pg.title = 'Public Transport Investment Survey'
  LIMIT 2;

  FOREACH i IN ARRAY poll_ids LOOP
    tok := encode(gen_random_bytes(32), 'hex');
    INSERT INTO action_tokens (token_hash, action_type, poll_id, expires_at, used)
      VALUES (tok, 'poll_vote', i, NOW() + INTERVAL '10 years', true);
    INSERT INTO poll_votes (poll_id, token_hash, choice) VALUES (i, tok, 'yes');
    INSERT INTO poll_participation (user_id, poll_id) VALUES (1, i);
  END LOOP;
END $$;

-- ── Anonymous bulk votes so analytics screens show real data ─────────────────
DO $$
DECLARE
  r RECORD;
  tok TEXT;
  j INT;
  total INT;
  yes_weight FLOAT;
BEGIN
  FOR r IN SELECT p.id, pg.title FROM polls p JOIN poll_groups pg ON pg.id = p.poll_group_id LOOP
    total := 50 + floor(random() * 400)::int;
    yes_weight := 0.4 + random() * 0.45;
    FOR j IN 1..total LOOP
      tok := encode(gen_random_bytes(32), 'hex');
      INSERT INTO action_tokens (token_hash, action_type, poll_id, expires_at, used)
        VALUES (tok, 'poll_vote', r.id, NOW() + INTERVAL '10 years', true);
      INSERT INTO poll_votes (poll_id, token_hash, choice)
        VALUES (r.id, tok, CASE WHEN random() < yes_weight THEN 'yes' ELSE 'no' END);
    END LOOP;
  END LOOP;
END $$;

INSERT INTO petitions (topic_id, title, description, required_verification_tier, signature_goal)
VALUES

-- Housing
(1,
 'Introduce a National Rent Cap of 2% Annual Increases',
 'Rental costs across Ireland have risen by over 60% in the past decade, far outpacing wage growth. Hundreds of thousands of renters are now spending more than 40% of their income on accommodation, leaving little for food, childcare, or savings. Rent Pressure Zones currently limit increases to 2% in designated areas, but coverage is inconsistent and enforcement is weak. We are calling on the government to extend a 2% annual cap to every rental property in the country, close existing loopholes that allow landlords to reset rent on re-letting, and establish an independent rent register with real-time public access. Without urgent intervention, an entire generation will be permanently locked out of stable housing.',
 2, 10000),

(1,
 'Fast-Track 20,000 Social and Affordable Homes Per Year',
 'Ireland is building fewer than 10,000 social and affordable homes annually against a need estimated at over 50,000 per year. The result is record homelessness, multi-year waiting lists, and families living in emergency accommodation for years. We call on the government to immediately increase the capital housing budget, streamline planning approvals for state-led housing projects, and set a legally binding annual delivery target of 20,000 social and affordable homes with quarterly public reporting. The housing crisis is a public health emergency and must be treated as one.',
 3, 50000),

-- Transport
(2,
 'Make All Public Transport Free for Under-25s',
 'Young people are disproportionately impacted by rising living costs and climate anxiety. Removing transport costs for under-25s would directly reduce financial pressure, increase educational participation, and reduce car dependency among the generation that will live longest with the consequences of our transport choices. A 50% young adult fare discount already exists — extending this to 100% for under-25s is a logical and affordable next step. We call on the National Transport Authority to pilot free public transport for all under-25s on the Leap Card network within 12 months.',
 2, 5000),

-- Healthcare
(3,
 'Guarantee a First Appointment within 12 Weeks for All Outpatients',
 'Over 900,000 people are on public hospital outpatient waiting lists in Ireland. Many wait two, three, or even five years for a first consultant appointment. This is not a resource problem alone — it is a system design failure. We call on the HSE and the Department of Health to publish a costed national waiting list action plan with a legally binding guarantee that no patient waits more than 12 weeks for a first outpatient appointment by 2027. Every week of delay means worsening conditions, avoidable suffering, and greater long-term cost to the state. This petition calls for accountability, investment, and a clear timeline.',
 2, 25000),

(3,
 'End the Two-Tier Mental Health System: Equal Funding for Mental and Physical Health',
 'Mental health services receive approximately 6% of the total HSE budget — one of the lowest proportions in the EU. The consequences are devastating: CAMHS waiting lists exceed 18 months in some CHO areas, adult community mental health teams are understaffed, and crisis services are overwhelmed. We call on the government to increase mental health funding to a minimum of 10% of the health budget by 2026, ring-fence funding for community mental health teams in every Local Health Office area, and publish annual mental health outcomes data so the public can hold the system accountable.',
 3, 15000),

-- Climate
(4,
 'Commit Ireland to Coal and Peat-Free Electricity by 2025',
 'Ireland''s last peat-fired power station was due to close but continues to receive state subsidy. At a time when Ireland is legally bound to reduce emissions by 51% by 2030, continued investment in peat and coal electricity is indefensible. We call on the government to set a firm, legislated end-date of 31 December 2025 for all coal and peat electricity generation, redirect subsidy payments to battery storage and grid infrastructure, and establish a just transition fund for workers and communities affected by the closure of fossil fuel plants.',
 3, 20000),

(4,
 'Require All New Public Buildings to be Built to Nearly Zero Energy Standard',
 'The built environment accounts for over 37% of Ireland''s energy-related emissions. Yet new public buildings — schools, Garda stations, council offices — are still being constructed without mandatory near-zero energy requirements. We call on the Department of Public Expenditure to update public works contracts to require all new state buildings to achieve NZEB (Nearly Zero Energy Building) standard, and to retrofit all existing public buildings to a minimum B2 BER rating by 2030. Leading by example in the public estate is the minimum we should expect from the state.',
 2, 8000),

-- Education
(5,
 'Abolish the Student Contribution Charge for All Full-Time Undergraduate Students',
 'The €3,000 annual student contribution charge — often called a "registration fee" — is a barrier to third-level education that disproportionately affects students from lower and middle-income families. Ireland is one of few EU countries that has maintained a significant student charge after its introduction in the 1990s. The SUSI grant does not cover the charge for the majority of students who fall outside income thresholds. We call on the government to abolish the student contribution charge entirely and replace lost revenue through increased exchequer funding, making third-level education free at the point of entry for all qualifying students.',
 2, 30000),

-- Technology
(6,
 'Require Platforms to Verify Age Before Allowing Under-16s to Create Accounts',
 'Social media platforms are legally required to refuse accounts to under-13s in most jurisdictions, yet age verification is almost never enforced. The mental health consequences for children and teenagers exposed to harmful content, cyberbullying, and addictive algorithm-driven feeds are well documented. We call on the government to introduce legislation requiring all social media platforms operating in Ireland to implement robust age verification for new accounts, and to face fines of up to 4% of global revenue for non-compliance under the Digital Services Act framework. Protecting children online requires enforceable standards, not voluntary commitments.',
 2, 12000),

-- Weekly
(7,
 'Introduce Emergency Cost of Living Payments for All Households Earning Under €45,000',
 'Energy, food, childcare, and rent costs have increased by an average of 18% since 2022. While the government has introduced some lump-sum payments, they have been inconsistent, poorly targeted, and insufficient in scale. Middle-income households earning just above social welfare thresholds have received little or no support, yet face the same cost pressures. We call on the Department of Finance to introduce a universal emergency cost of living payment of €500 per adult in households with a total income under €45,000, funded by windfall taxes on energy company profits. This is not a long-term measure — it is emergency relief for households under severe financial stress.',
 2, 40000);


INSERT INTO discussions (topic_id, title, body, created_by)
VALUES

-- Housing (topic 1) — long body
(1,
 'Why are we building luxury apartments nobody can afford?',
 'Walk through any new development in Dublin and the pattern is the same — gleaming towers with "luxury" in the name, studio apartments starting at €450,000, two-beds at €600k+, and a handful of ''affordable'' units buried in the small print at €350,000. This is not affordable. This is not social housing. This is investor-grade accommodation being rubber-stamped by planning authorities and celebrated as progress.

The core issue is that we have handed housing delivery almost entirely to private developers whose incentive is profit, not shelter. They will not build what people actually need — modest, well-insulated, family-sized homes at a price a nurse or a teacher can reach — because there is no profit margin in it. So they build what generates returns: compact units aimed at the rental market, sold to investment funds that will never be occupied by anyone who views them as a home.

Meanwhile we watch the social housing waiting list grow. We watch young families leave for cheaper countries. We watch the birth rate fall and ask ourselves why. The answer is staring at us from every construction hoarding on the M50.

The solution is not complicated. It just requires political will. Direct state construction, as we did in the 1950s and 60s. Local authorities with actual capital budgets and the staff to deploy them. An end to the Part V loophole that lets developers buy out their social housing obligation in cash. And a vacancy tax with real teeth — not the toothless 0.3% levy currently on the books.

I am not anti-development. I am anti-pretending that what is happening now constitutes a functioning housing system.',
 1),

-- Housing — short body
(1,
 'My landlord just increased rent by 18%. Is this legal?',
 'Got a notice this week — landlord is raising my rent from €1,450 to €1,710 citing "market rate". I''m in a Rent Pressure Zone. Pretty sure this is above the 2% cap. Does anyone know how to report this and has anyone actually had success getting it reversed through the RTB? The process seems deliberately confusing.',
 3),

-- Transport (topic 2) — medium body
(2,
 'The Luas is full by 7:45am — why isn''t frequency being increased?',
 'Every morning the Luas Red Line is sardine-tin packed by quarter to eight. People are being left on platforms because trams are full. This has been the case for years. Transdev and the NTA know this. The demand data is unambiguous.

So why is nothing happening? More trams were ordered years ago. The depot expansion in Broombridge was planned. Yet we are still running the same timetable we had before the population of the Docklands doubled.

I am not asking for the metro. I am not asking for BusConnects. I am asking for the very basic thing: when a service is full every single morning, you run it more often. Other cities manage this. Why can''t we?',
 4),

-- Transport — short
(2,
 'Cycling to work saved me €200 a month — why is the infrastructure so dangerous?',
 'Started cycling from Drumcondra to the city centre six months ago. Love it, but nearly got doored twice and had a van run a red light on me last week. The 200 euro a month saving is real but I feel like I''m taking my life in my hands. We have the demand. We do not have the infrastructure. Protected lanes, not painted lines.',
 6),

-- Healthcare (topic 3) — long
(3,
 'Waited 3 years for a dermatology appointment. This is the system working as designed.',
 'Three years. That is how long I waited from GP referral to first consultant appointment in a public dermatology clinic. Three years for something that, in a functioning health system, would be seen within six to eight weeks.

In the meantime I paid for two private consultations at €200 each because the condition was affecting my ability to work. So I paid twice — once through taxes funding a public system I could not access in any reasonable timeframe, and again out of pocket to get care I needed now.

I keep hearing politicians say the health service is underfunded. That is true. But it is also badly managed, structurally biased towards hospital care over community care, and deeply resistant to reform. Sláintecare was supposed to fix this. It has been implemented at a pace that makes glaciers look impatient.

What I want people to understand is that this is not an edge case. Dermatology, neurology, orthopaedics — waiting lists of two to four years are normal. This is the system working exactly as it has been designed to work, which is to make public care slow enough that anyone with money goes private. That is not an accident. It is a policy choice.',
 5),

-- Healthcare — short
(3,
 'GP charges €75 for a 10-minute appointment. Something has to change.',
 'Went to the GP with what turned out to be a minor ear infection. Seventy-five euro for ten minutes. The prescription cost another €15. That''s €90 for something that, in France or Germany, would have cost me nothing or close to it. I''m not on a medical card. I''m not earning a lot either. Universal GP care is not a radical idea — most of Europe has it.',
 7),

-- Climate (topic 4) — long
(4,
 'Is Ireland doing enough on climate? Let''s look at the actual numbers.',
 'I want to have a fact-based conversation here rather than a tribal one, because I think both sides of this debate are often talking past each other.

Ireland''s emissions in 2023 were down approximately 6.8% on 2018 levels. Our 2030 target is a 51% reduction. So we are running at roughly one seventh of the pace we need. That is the starting point.

Now, there are genuine reasons why Ireland''s decarbonisation is harder than some comparator countries. We have a large agricultural sector — about 38% of our emissions — where abatement options are genuinely limited with current technology. We had almost no domestic renewable capacity before 2010. Our grid is small, island-based, and difficult to interconnect.

But none of that explains the planning system blocking wind farms, the continued subsidy to peat generation, the failure to electrify the rail network, or the fact that Ireland has among the lowest modal share of public transport in the EU.

What I would like to see in this discussion: what specific policies do people think would move the needle? Not vague commitments — actual, costed, implementable measures that could realistically be in place within five years. Because pointing at agriculture and saying "it''s complicated" is not a climate policy.',
 5),

-- Climate — short
(4,
 'Genuinely baffled that peat power stations are still running in 2024',
 'Ireland has some of the best wind resources in Europe. We have made real progress on offshore wind. Yet Moneypoint and the midlands peat stations are still being propped up. What is the actual argument for continuing this? I have heard "grid stability" but that feels like a reason to invest in storage, not a reason to keep burning fossil fuels.',
 2),

-- Education (topic 5) — medium
(5,
 'My daughter was refused an SNA. The school has 4 children on the autism spectrum with one shared resource teacher.',
 'My daughter was assessed as requiring one-to-one support for significant periods of the school day. The NCSE refused the application for a dedicated SNA, citing "insufficient evidence of care need" despite the psychologist''s report explicitly recommending full-time support.

She is now in a class of 28. Her teacher is wonderful but cannot provide what she needs. She is coming home distressed most days.

I am not writing this to vent (well, partly). I am writing this because I know we are not alone. The gap between what the EPSEN Act promises and what children actually receive is enormous. If anyone has successfully appealed an SNA refusal or has advice on the process, please share.',
 3),

-- Education — short
(5,
 'Student grant hasn''t been updated for inflation in years. €6,000 doesn''t cover rent.',
 'The top-rate SUSI grant is around €6,000 a year. A room in Galway near NUIG now costs €800–€900 a month, which is €9,600 over a college year. So even with the maximum grant you''re €3,600 short on rent alone, before you buy a book or eat anything. The grant thresholds and amounts haven''t kept pace with anything. It needs a complete overhaul.',
 6),

-- Technology (topic 6) — long
(6,
 'Meta stored my location data for 7 years without consent. DPC did nothing meaningful.',
 'In 2021 the Irish Data Protection Commission fined Meta €17 million for data transparency failures. In the context of Meta''s annual revenue — roughly $120 billion — that is 0.014% of one year''s income. It is a rounding error. It is not a deterrent. It is the cost of doing business.

Ireland is the EU''s lead regulator for Google, Meta, Apple, Microsoft, and most of the major US tech platforms, because they have their European headquarters here for tax reasons. This means the DPC is, in practice, the privacy regulator for hundreds of millions of Europeans. And it is chronically under-resourced, slow, and has been criticised repeatedly by its EU counterparts for failing to bring cases to conclusion.

I work in data compliance and I want to be clear: the GDPR is a strong law. The problem is enforcement. When the DPC has a budget of €23 million and is up against in-house legal teams of hundreds of lawyers at trillion-dollar companies, the outcome is predictable.

The solution is a European-level enforcement authority with genuine resources and binding deadlines. Ireland cannot and will not fix this alone. The Commission needs to act.',
 1),

-- Technology — short
(6,
 'ChatGPT passed the Irish Leaving Cert — do we need to rethink exams?',
 'Someone ran the 2023 Leaving Cert papers through GPT-4 and it scored H2s and H3s across most subjects, including English and Geography. Not the point to catastrophise — but it does raise a genuine question about whether terminal exams testing recall and essay structure are still the right form of assessment when this technology is available to every student with a phone.',
 7),

-- Weekly (topic 7) — medium
(7,
 'The 4-day working week trial results are in — why isn''t this policy yet?',
 'The Irish pilot of the 4-day working week wrapped up with strong results: 97% of participating companies said they would continue the model, productivity was maintained or improved in the majority of cases, and employee wellbeing scores improved significantly. Similar results have come from pilots in the UK, Iceland, and Japan.

The economic case is not the problem. The political will is. There is a cohort of employers and politicians who view any reduction in working hours as inherently suspicious — a concession to laziness rather than an evidence-based productivity and wellbeing intervention.

I would like to hear from people who work in sectors where a 4-day week seems genuinely difficult — healthcare, hospitality, emergency services — and what a realistic model might look like for those sectors. Because "it won''t work everywhere" is being used to block it working anywhere.',
 4),

-- Weekly — short
(7,
 'Energy bills are still €200+ a month. The credits helped but they''re gone now.',
 'The electricity credits were welcome when they ran. My bills were around €280 a month last winter. With the credits they came down to about €160. Now they''re back up. Nothing structural has changed — the same grid, the same supplier, the same standing charges. The credits masked the problem for a year without fixing it.',
 2),

-- Community (topic 8) — medium
(8,
 'Our local council is planning a data centre on the last green field in the area',
 'An Bord Pleanála just granted permission for a 40-megawatt data centre on the last undeveloped green field site between two housing estates in our area. The site was originally zoned for community use — a park, a school, a health centre. The rezoning was approved without any public consultation meeting after the developer submitted a revised application.

Data centres now consume over 20% of Ireland''s total electricity. They create almost no local employment. They contribute to grid instability and carbon emissions. And in this case they are being built on land explicitly designated for community infrastructure.

Our residents'' association is exploring a judicial review. Does anyone have experience with this process or know of any environmental law groups who have successfully challenged similar decisions?',
 3);




INSERT INTO comments (discussion_id, user_id, body, verification_tier)
VALUES
-- Discussion 1: luxury apartments
(1, 2, 'The Part V point is huge. Developers paying cash in lieu of social units and that cash disappearing into a general fund rather than being ring-fenced for housing delivery is a scandal that gets almost no coverage.', 2),
(1, 4, 'I''d push back slightly on the "it''s simple" framing. State-led construction at scale requires land, planning staff, procurement capacity, and trades workers we don''t currently have. Not an excuse for inaction, but the constraints are real.', 2),
(1, 5, 'The land piece is the crux. We have land banks in local authority ownership sitting idle for a decade. Not because of planning — because there''s no capital budget to build on them. That is a political choice, not a structural constraint.', 3),
(1, 7, 'Moved back in with my parents at 31. Both of us working. Between us we earn €85k. We can''t get a mortgage large enough to buy anything within 30km of Dublin. This is the reality the statistics describe.', 2),

-- Discussion 2: rent increase
(2, 1, 'File a complaint with the RTB immediately. The 2% cap in RPZs applies regardless of what the landlord claims about "market rate". Document everything in writing. The RTB process is slow but they do uphold valid complaints.', 3),
(2, 5, 'Worth also checking the Residential Tenancies Board website — they have a rent calculator to check whether the increase is lawful. If you''re in an RPZ and the increase is above the cap, it''s not just unfair, it''s unlawful.', 3),

-- Discussion 3: Luas frequency
(3, 1, 'The Transdev contract is part of the problem. Frequency increases require renegotiating operational capacity commitments, which takes time and costs money. That''s not an excuse — it should have been built into the contract — but it explains why "just run more trams" is harder than it sounds.', 3),
(3, 6, 'The Red Line during peak hours is a genuine health and safety issue at this point. I''ve been on trams so packed that people couldn''t reach the emergency button. NTA needs to treat this as urgent.', 1),
(3, 7, 'Compare this to Zurich or Vienna where you never wait more than four minutes for any form of public transport. The ambition gap is what kills me. We set targets for 2040 that other cities achieved in 2005.', 2),

-- Discussion 4: cycling
(4, 2, 'The painted lane on the North Strand is exactly what you''re describing — exists on a map, provides almost no protection in practice. The difference between a painted lane and a protected lane with physical separation is the difference between a suggestion and infrastructure.', 2),
(4, 3, 'Started cycling last year. The routes that do have proper infrastructure are genuinely great. The problem is they''re disconnected — you get a kilometre of good lane and then you''re dumped into traffic. A network only works if it''s actually a network.', 1),

-- Discussion 5: healthcare waiting
(5, 2, 'The private-public split in hospitals is the structural driver of this. The same consultant who sees you in twelve weeks privately will see you in eighteen months publicly. Until that conflict of interest is addressed, no amount of additional funding will fix the waiting lists.', 2),
(5, 4, 'I work in the health service. The waiting list data that''s published is also not the full picture — it counts people waiting for a first appointment but doesn''t capture the waits at each subsequent step. The real patient journey from GP referral to treatment can be five or six years in some specialties.', 2),
(5, 6, 'Three years is a short wait in rheumatology. I know people who have waited five. By the time they''re seen the damage is done.', 1),

-- Discussion 6: GP charges
(6, 3, 'The argument against universal GP care is always cost. But the evidence from other countries is that it reduces costs system-wide because people access care earlier when it''s free, before conditions escalate to hospital admission. Prevention is cheaper than treatment.', 1),
(6, 5, 'We spend significantly less per capita on healthcare than comparable EU countries and then wonder why outcomes are worse. The GP charge is one symptom of systematic underinvestment.', 3),

-- Discussion 7: climate numbers
(7, 1, 'The agriculture point is valid but I''d push back on it being used as a blocker. The reality is that the marginal abatement cost in agriculture is high but not infinite, and other sectors where abatement is cheap and fast are not moving quickly enough to compensate. We need both.', 3),
(7, 4, 'The planning system blocking wind is the thing that frustrates me most. We have the resource. We have the technology. We have the investment. And then An Bord Pleanála takes three years to rule on a turbine application. That''s a policy failure, not an energy system failure.', 2),
(7, 6, 'Actual measures that would move the needle quickly: (1) Accelerate offshore wind permitting, (2) Electrify the rail network, (3) Mandatory solar on all new builds, (4) End dual fuel tariffs that penalise people who switch to heat pumps. None of these require technology that doesn''t exist.', 1),

-- Discussion 8: peat stations
(8, 1, 'Moneypoint closing in 2025 is confirmed. The peat stations are the more complex picture — Edenderry was supposed to transition to biomass but that has its own emissions and land use problems. "Not peat" doesn''t automatically mean good.', 3),
(8, 7, 'The grid stability argument is being made in bad faith by people who haven''t looked at what battery storage can do at this point. It was a legitimate concern five years ago. It''s a stalling tactic now.', 2),

-- Discussion 9: SNA refusal
(9, 1, 'The NCSE appeals process exists but it''s slow and the burden of evidence is on parents, not the system. FLAC (Free Legal Advice Centres) have done work in this space and may be able to advise. The National Council for Special Education website also has guidance on formal appeals.', 3),
(9, 2, 'We went through this. The appeal took eight months. We eventually got the SNA allocation but she had already lost most of first class. The system is designed to wear you down. Keep going.', 2),
(9, 5, 'The gap between the legal entitlement under EPSEN and what''s actually delivered is enormous and almost entirely undiscussed in mainstream political coverage. Thank you for sharing this.', 3),

-- Discussion 10: student grant
(10, 4, 'The means test thresholds haven''t been updated meaningfully in over a decade either. A family earning €46,000 gets almost nothing, but €46,000 in 2024 goes nowhere near as far as it did in 2012. The whole system needs an inflationary reset.', 2),
(10, 7, 'I had to defer for a year to save enough money to go back. That''s a year of lost earnings, lost time, compounding debt. The cost of not having a functioning grant system isn''t just personal — it''s economic.', 2),

-- Discussion 11: DPC/Meta
(11, 4, 'The DPC resource problem is real but I''d also point to cultural factors. There''s a pattern of regulatory deference to large employers in Ireland — we don''t want to bite the hand that provides 50,000 jobs in Dublin. That tension is never made explicit but it''s always present.', 2),
(11, 6, 'The GDPR fines are supposed to be proportionate to revenue for exactly this reason. 4% of global revenue for Meta would be approximately €5 billion. That would be noticed. The fact that the DPC has never come close to that level says everything.', 1),

-- Discussion 12: ChatGPT/Leaving Cert
(12, 3, 'The exam is already under pressure because of private grinds. Students with money perform better not because they''re more intelligent but because they''ve had more preparation. AI access is another layer of the same inequality.', 1),
(12, 5, 'Assessment reform is long overdue regardless of AI. We''ve known for years that a high-stakes terminal exam tests performance under pressure more than it tests learning. Portfolio assessment, project work, continuous assessment — none of these are new ideas.', 3),

-- Discussion 13: 4-day week
(13, 3, 'The hospitality sector is the genuine hard case. A 4-day week in a restaurant or hotel doesn''t obviously work without hiring more staff, and margins are too tight for that. I''d like to see specific proposals for those sectors rather than assuming the pilot results generalise everywhere.', 1),
(13, 1, 'The Iceland results showed that even in care sectors — social work, healthcare support — the model can work with creative rostering. It requires management investment to redesign work, not just remove a day. The companies that succeeded did the design work.', 3),
(13, 7, 'Productivity per hour is already higher in countries with shorter working weeks. The correlation between hours worked and output is weakly positive at best and negative at the margin. We are not a culture that has come to terms with this evidence.', 2),

-- Discussion 14: energy bills
(14, 4, 'The standing charges are the part that never gets discussed. Fixed charges of €300+ a year before you use a single unit. They''ve increased by over 40% in two years. These hit people who use very little energy the hardest — elderly people, people in small flats — and they don''t reduce when wholesale prices fall.', 2),
(14, 2, 'Switched to a smaller supplier last year. Bills dropped about €40 a month. Worth shopping around even if it feels like a lot of admin.', 2),

-- Discussion 15: data centre / community
(15, 5, 'Judicial review is possible but expensive and uncertain. The Environmental Pillar and An Taisce have experience with similar challenges. I''d also look at whether the rezoning process itself was procedurally sound — if public consultation requirements weren''t met, that''s a stronger ground.', 3),
(15, 1, 'The 20% electricity figure is now closer to 25% and rising. At some point the grid operator will have to make choices about priority connections. Data centres vs. housing developments vs. renewable generators. That conversation is coming whether we have it now or not.', 3);

INSERT INTO discussion_votes (discussion_id, user_id, value)
VALUES
(1, 2,  1), (1, 4,  1), (1, 5,  1), (1, 6,  1), (1, 7,  1),
(2, 1,  1), (2, 5,  1), (2, 4,  1),
(3, 1,  1), (3, 4,  1), (3, 6,  1), (3, 7,  1),
(4, 2,  1), (4, 3,  1), (4, 5,  1),
(5, 2,  1), (5, 4,  1), (5, 6,  1), (5, 7,  1),
(6, 3,  1), (6, 5,  1),
(7, 1,  1), (7, 4,  1), (7, 5,  1), (7, 6,  1), (7, 2, -1),
(8, 1,  1), (8, 7,  1),
(9, 1,  1), (9, 2,  1), (9, 5,  1), (9, 6,  1),
(10, 4, 1), (10, 7, 1), (10, 3, 1),
(11, 4, 1), (11, 6, 1), (11, 3, 1), (11, 7, 1),
(12, 3, 1), (12, 5, 1), (12, 2, -1),
(13, 3, 1), (13, 1, 1), (13, 7, 1), (13, 4, 1),
(14, 4, 1), (14, 2, 1), (14, 6, 1),
(15, 5, 1), (15, 1, 1), (15, 3, 1);

-- Helper to bulk-insert signatures for a given petition
DO $$
DECLARE
  rec RECORD;
  counts INT[] := ARRAY[7840, 31200, 3100, 18900, 9200, 14700, 6300, 24100, 5500];
  pid   INT;
  cnt   INT;
  tok   TEXT;
BEGIN
  FOR i IN 1..array_length(counts, 1) LOOP
    SELECT id INTO pid FROM petitions ORDER BY id LIMIT 1 OFFSET (i - 1);
    cnt := counts[i];
    FOR j IN 1..cnt LOOP
      tok := encode(gen_random_bytes(32), 'hex');
      INSERT INTO action_tokens (token_hash, action_type, petition_id, expires_at, used)
        VALUES (tok, 'petition_sign', pid, NOW() + INTERVAL '10 years', true);
      INSERT INTO petition_signatures (petition_id, token_hash)
        VALUES (pid, tok);
    END LOOP;
  END LOOP;
END $$;

