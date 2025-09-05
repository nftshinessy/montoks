# Montoks - Monad Token Scanner


Montoks is an advanced security scanner for tokens on the Monad network. Analyze contract risks, holder distribution, and liquidity safety.

## Features

- **Security Audit**: Comprehensive contract analysis to detect vulnerabilities and scam patterns
- **Holder Analysis**: Detailed examination of token distribution and concentration risks
- **Liquidity Check**: Verification of liquidity pool status and lock information
- **Real-time Data**: Live gas prices and MON token prices
- **Risk Assessment**: Automated risk scoring with detailed risk factors

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js
- TypeScript
- BlockVision API
- Monorail API
- QuickNode RPC

## Project Structure

```text
montoks/
├── backend/
│ ├── src/
│ │ ├── cache.ts
│ │ ├── riskAnalysis.ts
│ │ ├── server.ts
│ │ └── types.ts
│ ├── package.json
│ └── tsconfig.json
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Markets.tsx
│ │ │ ├── RiskAnalysis.tsx
│ │ │ ├── TokenOverview.tsx
│ │ │ ├── Logo.tsx
│ │ │ └── TopHolders.tsx
│ │ ├── pages/
│ │ │ ├── Home.tsx
│ │ │ └── TokenAnalysis.tsx
│ │ ├── App.tsx
│ │ ├── index.css
│ │ ├── vite-env.d.ts
│ │ └── main.tsx
│ ├── index.html
│ ├── postcss.config.js
│ ├── package.json
│ ├── tailwind.config.js
│ ├── vite.config.ts
│ └── tsconfig.json
├── package.json
└── README.md
```

1. Clone the repository:
```bash
git clone https://github.com/nftshinessy/montoks.git
cd montoks
```

2. Install root dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
npm run install-backend
```

4. Install frontend dependencies:
```bash
npm run install-frontend
```
Or install all dependencies at once:
```bash
npm run install-all
```

## Configuration

### Frontend Environment Variables

Create a .env file in the backend directory:

```bash
PORT=YOUR_PORT
MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
CORS_ORIGIN=http://localhost:3000
NODE_ENV=production
BLOCKVISION_API_KEY=your_blockvision_api_key
BLOCKVISION_API_BASE=https://api.blockvision.org/v2/monad-testnet
MONORAIL_IDENTIFIER=your_monorail_identifier
QUICKNODE_RPC_URL=your_quicknode_rpc_url
```

### Frontend Environment Variables

Create a .env file in the frontend directory:

```bash
VITE_API_BASE_URL=/api
VITE_APP_NAME=Montoks
```


## Development

Start both frontend and backend in development mode:

```bash
npm run dev
```

Or start them separately:

```bash
# Backend only
npm run dev-backend

# Frontend only
npm run dev-frontend
```


##  API Endpoints

 **```GET /api/gas-price```** - Get current gas price

 **```GET /api/mon-price```** - Get current MON price

 **```GET /api/token/:contractAddress```** - Analyze a token

 **```GET /api/tokens/category/:category```** - Get tokens by category

 **```GET /api/blockvision/token/:address/holders```** - Get token holders from BlockVision

 **```GET /api/blockvision/token/:address/detail```** -  Get token details from BlockVision












