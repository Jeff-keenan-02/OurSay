# OurSay

A privacy-preserving civic engagement platform that lets citizens vote on polls, sign petitions, and discuss local issues — while making it structurally difficult for bots or duplicate accounts to manipulate the outcome.

Built as a Final Year Project at TU Dublin.

## The Problem

Online civic platforms face a contradiction: they need to know a participant is a real, unique person to make results trustworthy, but forcing people to attach their real identity to every vote or comment kills honest participation and creates a privacy liability. Most platforms pick one side — either loose "email sign-up" verification that bots trivially defeat, or heavy identity requirements that expose exactly who voted for what.

OurSay was built to explore a third option: **verify that someone is a real, unique, eligible person once, then let them participate anonymously from that point on** — so the platform can prove a vote came from a genuine, non-duplicate citizen without ever being able to link that vote back to their identity.

The motivation was simple — watching how quickly bot and fake accounts degrade trust in engagement numbers on platforms like Instagram, and wanting a way to actually surface what real people think, with results that can't be quietly gamed.

## How Verification & Anonymity Work

Identity and participation are deliberately kept in separate systems that never share a direct reference to each other.

**Tiered identity verification**, each tier unlocking more participation rights:

| Tier | Verification | Unlocks |
|------|--------------|---------|
| 0 | Liveness check (web bridge) | Browsing, following topics |
| 1 | Passport verification | Voting on polls, signing petitions |
| 2–3 | Residence verification | Commenting, creating polls/petitions |

**The anonymity layer:** once a user passes a verification tier, their identity document is never stored in a form that's linked to their votes. Instead, verification produces a one-way hash — a unique token that proves "this is a verified, eligible, unique person" without revealing *who*. That hash is what gets checked against `poll_identity_usage` / `petition_identity_usage` to enforce **one vote per real person, per poll** — the system can prove no one voted twice, without ever knowing who voted at all.

This is why votes/signatures and identity-usage tracking live in separate tables (`poll_votes` vs `poll_identity_usage`) rather than one combined record — it's a deliberate structural separation, not an oversight: even with full database access, you can't join "who verified" to "who voted for what."

*[Note to self before publishing: add 2–3 sentences here on the actual hashing scheme — one-way hash function used, and what specifically prevents someone from re-deriving identity from the hash, e.g. salting approach.]*

## Architecture

- **Mobile App** — React Native CLI (TypeScript), iOS & Android
- **Backend** — Node.js / Express REST API
- **Database** — PostgreSQL 15
- **Auth** — JWT (stateless auth, dynamic tier resolution per request — a user's access level is derived fresh from their verification state on each request rather than cached in a long-lived session, so a tier change takes effect immediately)
- **Verification** — Tiered identity model (liveness → passport → residence), decoupled from participation data

## Key Design Decisions

- **Stateless, tier-aware JWTs.** Rather than storing a user's access tier in the session and trusting it until re-login, tier is resolved dynamically per request. This closes a real gap: if a user's verification status changes (or is revoked), they can't keep acting on stale privileges until their token happens to expire.
- **Separated identity-usage tables from participation tables.** `poll_identity_usage` and `petition_identity_usage` exist purely to answer "has this verified person already acted here" — they intentionally hold no content, so a breach of the participation tables alone reveals no identity linkage, and a breach of identity-usage tables alone reveals no opinions.
- **One-way hashing over storing raw identity.** The system needs to prove uniqueness, not retain identity — so identity documents are processed into a hash at verification time rather than persisted, minimising what's exposed if the database is ever compromised.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 10+ |
| PostgreSQL | 15 |
| Docker & Docker Compose | any recent |
| Ruby | 3.x (iOS only) |
| CocoaPods | 1.13+ (iOS only) |
| Xcode | latest stable (iOS only) |
| Android Studio + SDK | latest stable (Android only) |

## Quick Start (Docker — Recommended)

```bash
git clone https://github.com/your-username/OurSay.git
cd OurSay
docker compose up --build
```

This starts:
- PostgreSQL on port `5431`
- Express API on port `3000`

The database schema must be applied manually on first run (see [Database Setup](#database-setup) below).

## Manual Setup

### 1. Database

```bash
psql -U postgres
```

```sql
CREATE USER oursay WITH PASSWORD 'your_password_here';
CREATE DATABASE oursaydb OWNER oursay;
\q
```

Apply the schema:

```bash
psql -U oursay -d oursaydb -f backend/src/db/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
DB_HOST=localhost
DB_PORT=5431
DB_USER=oursay
DB_PASSWORD=your_password_here
DB_NAME=oursaydb
JWT_SECRET=your_jwt_secret_here
PASSWORD_SALT=your_salt_here
```

Start the server:

```bash
node src/server.js
```

The API will be available at `http://localhost:3000`.

### 3. Mobile App

```bash
npm install
```

#### iOS

```bash
bundle install
bundle exec pod install
npx react-native run-ios
```

#### Android

```bash
npx react-native run-android
```

> Make sure an emulator is running or a device is connected before running the above commands.

## Database Setup

The schema file is located at `backend/src/db/schema.sql`. It defines all tables including:

- `users`, `verifications`
- `topics`, `poll_groups`, `polls`, `poll_votes`, `poll_participation`, `poll_identity_usage`
- `petitions`, `petition_signatures`, `petition_participation`, `petition_identity_usage`
- `action_tokens`, `discussions`, `comments`

To apply:

```bash
psql -U oursay -d oursaydb -f backend/src/db/schema.sql
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5431` |
| `DB_USER` | Database user | `oursay` |
| `DB_PASSWORD` | Database password | — |
| `DB_NAME` | Database name | `oursaydb` |
| `JWT_SECRET` | Secret for signing JWTs | — |
| `PASSWORD_SALT` | Salt for password hashing | — |
| `DATABASE_URL` | Full connection string (overrides above, used on Render) | — |

## Project Structure

```
OurSay/
├── src/                    # React Native app source
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   └── services/
├── backend/
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── services/       # Business logic + transactions
│       ├── middleware/     # Auth, tier enforcement
│       ├── routes/
│       └── db/              # Pool config + schema.sql
├── docker-compose.yml
└── __tests__/              # Jest test suite
```

## Running Tests

```bash
# From project root
npm test
```

## Status & Roadmap

This was built as a Final Year Project and is currently a working prototype rather than a deployed production system. Known next steps:

- [ ] Deploy a live demo instance
- [ ] Load-test the identity-usage lookups under concurrent voting
- [ ] Add rate limiting on verification endpoints

## Notes