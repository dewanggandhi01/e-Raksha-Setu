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

  // print a minimal JSON for convenience
  const fs = require("fs");
  const out = {
    address: deployedAddress,
    network: hre.network.name
  };
  fs.writeFileSync("deployed-address.json", JSON.stringify(out, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
