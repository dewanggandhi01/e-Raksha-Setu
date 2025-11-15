const hre = require("hardhat");
require("dotenv").config();

async function main() {
  // load deployed address
  const fs = require("fs");
  const data = JSON.parse(fs.readFileSync("deployed-address.json", "utf8"));
  const address = data.address;

  const provider = hre.ethers.provider;
  const [signer] = await hre.ethers.getSigners();

  const TouristSafety = await hre.ethers.getContractFactory("TouristSafety");
  const contract = TouristSafety.attach(address).connect(signer);
  const readContract = TouristSafety.attach(address).connect(hre.ethers.provider);

  console.log("Using contract at", address);
  const code = await provider.getCode(address);
  console.log("Contract code length:", code ? code.length : 0);
  console.log("Account:", await signer.getAddress());

  // Example: register a user
  const tx1 = await contract.registerUser("Alice", "encrypted-key-placeholder");
  const r1 = await tx1.wait();
  console.log("registerUser tx mined, txHash:", tx1.hash);
  // decode events from receipt
  r1.logs.forEach((l) => {
    try {
      const parsed = contract.interface.parseLog(l);
      console.log("event:", parsed.name, parsed.args);
    } catch (e) {
      // non-contract log
    }
  });

  // Add emergency log
  const tx2 = await contract.addEmergencyLog("enc-location-123", "high");
  const r2 = await tx2.wait();
  console.log("addEmergencyLog tx mined, txHash:", tx2.hash);
  r2.logs.forEach((l) => {
    try {
      const parsed = contract.interface.parseLog(l);
      console.log("event:", parsed.name, parsed.args);
    } catch (e) {}
  });

  // Grant police access (use another address for demonstration if available)
  const police = hre.ethers.Wallet.createRandom().address;
  const tx3 = await contract.grantPoliceAccess(police);
  const r3 = await tx3.wait();
  console.log("grantPoliceAccess tx mined to police:", police, "txHash:", tx3.hash);
  r3.logs.forEach((l) => {
    try {
      const parsed = contract.interface.parseLog(l);
      console.log("event:", parsed.name, parsed.args);
    } catch (e) {}
  });

  console.log("Finished: events printed from receipts (registerUser, addEmergencyLog, grantPoliceAccess).");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
