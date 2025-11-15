# e-Raksha-Setu Server

A minimal Express + Mongoose backend to store registered users from the app.

Setup

1. Install dependencies

```powershell
cd server
npm install
```

2. Create `.env` from `.env.example` and set `MONGO_URI`

Example `.env`:

```
MONGO_URI=mongodb+srv://user1:test123@cluster0.zahjt9b.mongodb.net/eRakshaSetu?retryWrites=true&w=majority
PORT=4000
```

3. Run server

```powershell
npm run start
# or for live reload
npm run dev
```

API

- POST `/api/users/register`  — register or upsert a user
  - body: `{ address, name, encryptedPrivateKey }`
- GET `/api/users` — list users
- GET `/api/users/:address` — get user by address

CORS is enabled so the mobile app (Expo) can call these endpoints during development.

Notes

- This is a minimal demo server for hackathon/demo use only. Do not store real private keys in plaintext in production. Use secure storage and proper authentication in production.
