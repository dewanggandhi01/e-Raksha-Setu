const hre = require("hardhat");
require("dotenv").config();

async function main() {
  await hre.run("compile");

  const TouristSafety = await hre.ethers.getContractFactory("TouristSafety");
  console.log("Deploying TouristSafety...");
  const tourist = await TouristSafety.deploy();
  await tourist.waitForDeployment();

  const deployedAddress = await tourist.getAddress();
  console.log("TouristSafety deployed to:", deployedAddress);

  const TouristLogChain = await hre.ethers.getContractFactory("TouristLogChain");
  console.log("Deploying TouristLogChain...");
  const logChain = await TouristLogChain.deploy();
  await logChain.waitForDeployment();

  const logChainAddress = await logChain.getAddress();
  console.log("TouristLogChain deployed to:", logChainAddress);

  const fs = require("fs");
  const out = {
    TouristSafety: deployedAddress,
    TouristLogChain: logChainAddress,
    network: hre.network.name
  };
  fs.writeFileSync("deployed-address.json", JSON.stringify(out, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
