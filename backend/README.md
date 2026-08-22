# Food Rescue Network — Backend API

Surplus food from restaurants, hotels, hostels, and events, routed to volunteers and NGOs who can collect it.

Built for a hackathon: Node.js, Express, and PostgreSQL. Member 3 (REDDY) owns this backend.

## Features

- Create, list, update, and expire food listings
- Claim food with a database transaction (prevents double-claim races)
- Track claim and listing status (`available` → `claimed` → `collected` → `delivered`)
- Nearby search with the Haversine formula (kilometers, no PostGIS required)
- Users with roles: `provider`, `volunteer`, `ngo`, `admin`
- Health check with optional database ping
- Helmet, CORS, parameterized SQL, and express-validator

## Technology stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js (JavaScript, CommonJS) |
| HTTP | Express.js |
| Database | PostgreSQL (`pg` Pool) |
| Config | dotenv |
| Security | helmet, cors |
| Validation | express-validator |
| Tests | Jest, Supertest |
| Deploy | Render |

## Folder structure

```
food-rescue-backend/
├── src/
│   ├── config/database.js
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── utils/distance.js
│   └── app.js
├── database/
│   ├── schema.sql
│   └── seed.sql
├── tests/
├── server.js
├── package.json
├── .env.example
├── render.yaml
└── README.md
```

`server.js` starts the process. `src/app.js` configures Express so tests can import the app without opening a port.

## Installation

```bash
cd food-rescue-backend
npm install
copy .env.example .env
```

On macOS/Linux use `cp .env.example .env`. Edit `.env` and set a real `DB_PASSWORD`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DB_HOST` | PostgreSQL host (local: `localhost`) |
| `DB_PORT` | PostgreSQL port (usually `5432`) |
| `DB_NAME` | Database name (`food_rescue`) |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password — never commit this |
| `PORT` | HTTP port (local fallback `5000`) |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_URL` | Allowed CORS origin |
| `DATABASE_URL` | Optional single URL (Render). If set, it is used instead of `DB_*` |
| `DB_SSL` | Set `true` to force SSL when not in production |

Never return `.env` values from API responses.

## PostgreSQL setup

1. Install PostgreSQL and start the service.
2. Create the database:

```sql
CREATE DATABASE food_rescue;
```

3. Apply schema and seed data (psql examples):

```bash
psql -U postgres -d food_rescue -f database/schema.sql
psql -U postgres -d food_rescue -f database/seed.sql
```

Windows (adjust the path to `psql` if needed):

```powershell
psql -U postgres -d food_rescue -f database\schema.sql
psql -U postgres -d food_rescue -f database\seed.sql
```

## Database schema

**users** — `id`, `name`, `role`, `organization`, `location`, `created_at`  
**food_listings** — surplus food, `status`, `claimed_by`, coordinates, `available_until`  
**claims** — `listing_id` → `food_listings.id`, `volunteer_id` → `users.id`

Indexes exist on listing `status`, `available_until`, `latitude`, and `longitude`. A unique partial index allows only one active (`claimed`) claim per listing.

Statuses:

- Listings: `available`, `claimed`, `collected`, `delivered`, `expired`, `cancelled`
- Claims: `claimed`, `collected`, `cancelled`

## Running locally

```bash
npm start
```

Open [http://localhost:5000](http://localhost:5000). You should see:

`Food Rescue Backend is running!`

Health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

The server uses `process.env.PORT` and falls back to `5000` only in development.

## API documentation

All JSON responses use:

```json
{ "success": true, "data": {} }
```

Collections also include `"count"`. Errors:

```json
{ "success": false, "error": { "message": "Food listing not found" } }
```

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/` | Original running message |
| GET | `/api/health` | API health; `data.database` is `connected` or `disconnected` |
| POST | `/api/listings` | Create listing (`status` set to `available`) |
| GET | `/api/listings` | Default: available and not expired. Query: `status`, `food_type`, `location` |
| GET | `/api/listings/nearby` | Query: `latitude`, `longitude`, `radius` (km, default 10) |
| GET | `/api/listings/:id` | 404 if missing |
| PUT | `/api/listings/:id` | Update fields; does not change `id` or `created_at` |
| PATCH | `/api/listings/:id/status` | Validated transitions only |
| POST | `/api/listings/:id/claim` | Body: `{ "volunteer_id": 7 }` — transaction + row lock |
| POST | `/api/users` | Body includes `name` and `role` |
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | One user |
| GET | `/api/claims` | List claims |
| GET | `/api/claims/:id` | One claim |
| PATCH | `/api/claims/:id/status` | `collected` or `cancelled` from `claimed` |

Create listing example:

```json
{
  "provider_name": "ABC Restaurant",
  "food_type": "Cooked Rice",
  "quantity": 25,
  "description": "Fresh cooked rice",
  "location": "Tirunelveli",
  "latitude": 8.7139,
  "longitude": 77.7567,
  "available_until": "2026-08-22T18:00:00"
}
```

Nearby example:

`GET /api/listings/nearby?latitude=8.7139&longitude=77.7567&radius=10`

## Testing

```bash
npm test
```

Tests cover health, listings CRUD, validation, claims, double-claim, status, nearby search, users, and expired listings. PostgreSQL must be running and `food_rescue` must exist with the schema applied.

## Deployment (Render)

1. Push this repo to GitHub (do **not** commit `.env`).
2. In Render, create a Web Service from the repo, or use `render.yaml`.
3. Create a PostgreSQL database on Render.
4. Set environment variables:

- `NODE_ENV=production`
- `DATABASE_URL` (Render provides this)
- `FRONTEND_URL` (your deployed frontend origin)
- `PORT` is set automatically by Render — do not hard-code `5000`

5. After first deploy, run `database/schema.sql` (and optionally `seed.sql`) against the Render database (Render shell or any SQL client).

6. Confirm:

- `GET https://<your-service>.onrender.com/api/health`
- `data.database` is `connected`
- A sample `POST /api/listings` works
- Browser calls from the frontend origin are allowed by CORS

## Production environment variables

Use either:

- `DATABASE_URL=postgresql://user:password@host:5432/dbname`

or:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

Always set `NODE_ENV=production` and `FRONTEND_URL`.

## Frontend integration

- Base URL (local): `http://localhost:5000`
- Send `Content-Type: application/json`
- Set `FRONTEND_URL` to the frontend origin so CORS allows the browser
- Nearby search needs `latitude`, `longitude`, and optional `radius`
- Only `volunteer` and `ngo` users can claim listings

## Git setup

```bash
git init
git add .
git commit -m "Add Food Rescue Network backend API"
git remote add origin <your-github-repo-url>
git push -u origin main
```

`.gitignore` excludes `node_modules/`, `.env`, `coverage/`, and `*.log`.
