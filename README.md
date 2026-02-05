# M-Pesa Daraja Dashboard
Full-stack project with a Node/Express backend and a React (Vite) frontend for M-Pesa (Daraja) operations.

## Project Structure
- `server/` — Express API, MongoDB driver, Daraja services, logging
- `client/frontend/` — React + Vite UI dashboard

## Requirements
- Node.js 18+
- MongoDB (local or Atlas)

## Quick Start
### 1) Server
```bash
cd server
npm install
```

Create `server/.env` (sample keys):
```
MONGODB_URI=mongodb+srv://user:pass@cluster/db
MONGODB_DB=mpesa

MPESA_ENV=sandbox
MPESA_SANDBOX_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_SANDBOX_CONSUMER_KEY=
MPESA_SANDBOX_CONSUMER_SECRET=

MPESA_PROD_BASE_URL=https://api.safaricom.co.ke
MPESA_PROD_CONSUMER_KEY=
MPESA_PROD_CONSUMER_SECRET=
```

Start the server:
```bash
cd server
npm start
```

Optional ngrok (PowerShell):
```bash
$env:USE_NGROK="true"
npm start
```

The server sets `MPESA_CALLBACK_URL` at runtime to the ngrok URL or `http://HOST:PORT`.

### 2) Client
```bash
cd client/frontend
npm install
npm run dev
```

Optional API base URL (client/frontend/.env):
```
VITE_API_BASE_URL=http://localhost:3000
```

## Features
- STK Push form with status feedback
- Transactions table with status badges
- QR code generator
- Ratiba scheduling UI
- Pull & sync transactions UI
- M-Pesa request/response/callback logging
- MongoDB collections for logs and callbacks
- Middleware: rate limiting, validation, webhook signature validation, centralized errors

## Backend API
### Payments
- `POST /api/mpesa/stk-push`
- `POST /api/mpesa/b2c`
- `POST /api/mpesa/b2b`
- `POST /api/mpesa/transaction-status`
- `POST /api/mpesa/account-balance`
- `POST /api/mpesa/reversal`
- `POST /api/mpesa/qr`
- `POST /api/mpesa/ratiba`
- `POST /api/mpesa/pull-transactions`

### History (for polling)
- `GET /api/mpesa/transactions?limit=50`

### Logging
- `POST /api/mpesa/logs/requests`
- `POST /api/mpesa/logs/responses`
- `POST /api/mpesa/logs/callbacks` (requires `x-webhook-signature`)

## Frontend API Helpers
Located at `client/frontend/src/services/api.js`, with helpers for all payment endpoints.

## Notes
- MongoDB collections used: `mpesa_logs`, `callback_logs`.
- Backend entry: `server/index.js`
- Frontend entry: `client/frontend/src/App.jsx`
