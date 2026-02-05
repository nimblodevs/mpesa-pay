# M-Pesa Daraja Dashboard
Full-stack project with a Node/Express backend and a React (Vite) frontend for M-Pesa (Daraja) operations.

## Structure
- `server/` — Express API, Prisma (MongoDB), Daraja services, logging
- `client/` — React + Vite UI dashboard

## Requirements
- Node.js 18+
- MongoDB (local or Atlas)

## Setup
### Server
```bash
cd server
npm install
```

Create and update `server/.env`:
- `DATABASE_URL`
- `MPESA_ENV` (`sandbox` or `production`)
- `MPESA_SANDBOX_*` / `MPESA_PROD_*`
- `MPESA_*_ENDPOINT` values if you use custom endpoints

Start the server:
```bash
cd server
npm start
```

Optional ngrok:
```bash
set USE_NGROK=true
npm start
```

The server will set `MPESA_CALLBACK_URL` automatically to either the ngrok URL or the local URL.

### Client
```bash
cd client
npm install
npm run dev
```

Optional API base URL:
Create `client/.env`:
```
VITE_API_BASE_URL=http://localhost:3000
```

## Key Features
- STK Push form with status feedback
- Transactions table with status badges
- QR code generator
- Ratiba scheduling UI
- Pull & sync transactions UI
- M-Pesa request/response/callback logging APIs
- Prisma MongoDB models
- Middleware: rate limiting, validation, webhook signature validation, centralized errors

## API Notes
The frontend `src/services/api.js` includes helpers for:
- STK Push, B2C, B2B
- Transaction status, account balance, reversal
- QR code generation, Ratiba, pull transactions

## Development Notes
- Backend entry point: `server/index.js`
- Frontend entry point: `client/src/App.jsx`
