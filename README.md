# OurSay

A privacy-preserving civic engagement platform built as a Final Year Project at TU Dublin. Citizens can vote on polls, sign petitions, and engage with local issues — with identity verification enforced but votes and signatures kept anonymous through a layered anonymisation model.

## Architecture

- **Mobile App** — React Native CLI (TypeScript), iOS & Android
- **Backend** — Node.js / Express REST API
- **Database** — PostgreSQL 15
- **Auth** — JWT (stateless auth, dynamic tier resolution per request)
- **Verification** — Tiered identity model (liveness → passport → residence)

---

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

---

## Quick Start (Docker — Recommended)

The fastest way to get the backend and database running together:

```bash
git clone https://github.com/your-username/OurSay.git
cd OurSay
docker compose up --build
```

This starts:
- PostgreSQL on port `5431`
- Express API on port `3000`

The database schema must be applied manually on first run (see [Database Setup](#database-setup) below).

---

## Manual Setup

### 1. Database

Start PostgreSQL locally and create the database:

```bash
psql -U postgres
```

```sql
CREATE USER oursay WITH PASSWORD 'RILEY2015';
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
DB_PASSWORD=RILEY2015
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

Install dependencies from the project root:

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

---

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

---

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

---

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
│       ├── middleware/      # Auth, tier enforcement
│       ├── routes/
│       └── db/             # Pool config + schema.sql
├── docker-compose.yml
└── __tests__/              # Jest test suite
```

---

## Running Tests

```bash
# From project root
npm test
```

---

## Notes

- Liveness verification is currently in **mock mode** — it simulates approval without calling an external provider. In a production deployment this would be replaced by a provider such as Onfido.
- Passport OCR uses Google Cloud Vision. The integration is present but the service is disabled by default; mock mode is used instead.
- The `topic_id` in `createPetition` is hardcoded to `8` — this is a known placeholder for a future topic-selection flow.
