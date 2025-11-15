const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");

function buildBlocksFromLogs(logHashes, logsPerBlock = 10) {
  const blocks = [];
  let previousBlockHash = ethers.constants.HashZero;

  let index = 0;
  for (let i = 0; i < logHashes.length; i += logsPerBlock) {
    const batch = logHashes.slice(i, i + logsPerBlock);
    const timestamp = Math.floor(Date.now() / 1000);

    const encoded = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes32", "bytes32[]", "uint256"],
      [index, previousBlockHash, batch, timestamp]
    );
    const blockHash = ethers.utils.keccak256(encoded);

    blocks.push({
      index,
      previousBlockHash,
      logs: batch,
      timestamp,
      blockHash,
    });

    previousBlockHash = blockHash;
    index += 1;
  }

  return blocks;
}

async function main() {
  const deployed = JSON.parse(fs.readFileSync("deployed-address.json", "utf8"));
  const logChainAddress = deployed.TouristLogChain;
  if (!logChainAddress) {
    throw new Error("TouristLogChain address not found in deployed-address.json");
  }

  const rawLogs = [
    { touristID: "T1", location: "X1", timestamp: Date.now(), alertType: "SAFE" },
    { touristID: "T2", location: "X2", timestamp: Date.now(), alertType: "ALERT" },
    { touristID: "T3", location: "X3", timestamp: Date.now(), alertType: "SAFE" },
    { touristID: "T4", location: "X4", timestamp: Date.now(), alertType: "ALERT" },
  ];

  const logHashes = rawLogs.map((log) => {
    const json = JSON.stringify(log);
    const bytes = ethers.toUtf8Bytes(json);
    return ethers.keccak256(bytes);
  });

  console.log("Log hashes:", logHashes);

  const blocks = buildBlocksFromLogs(logHashes, 2);

  console.log(`Built ${blocks.length} blocks`);

  const TouristLogChain = await hre.ethers.getContractFactory("TouristLogChain");
  const chain = await TouristLogChain.attach(logChainAddress);

  for (const block of blocks) {
    console.log(`Pushing block index=${block.index}`);
    console.log(`blockHash=${block.blockHash}`);
    console.log(`previousBlockHash=${block.previousBlockHash}`);
    const tx = await chain.addBlock(block.blockHash, block.previousBlockHash);
    const receipt = await tx.wait();
    console.log(`Block ${block.index} stored in tx: ${receipt.transactionHash}`);
  }

  console.log("All blocks pushed to chain.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
