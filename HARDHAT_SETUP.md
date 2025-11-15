Quick Hardhat + ethers setup for this repository

1) Install dependencies

   In PowerShell at project root run:

   npm install

2) Start a local Hardhat node (optional - for local testing)

   npm run node

3) Deploy to the running local node

   In a new terminal (project root):

   npm run deploy

   This will compile and deploy `TouristSafety` and write `deployed-address.json`.

4) Interact with the deployed contract (example)

   npm run interact

Notes
- If you want to deploy to a testnet, set `PRIVATE_KEY` and `LOCALHOST_RPC` (RPC_URL for that network) in `.env` and update `hardhat.config.js` networks.
- The contract Solidity version is `0.8.20` — the Hardhat config is set accordingly.
