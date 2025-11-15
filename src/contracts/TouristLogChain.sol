// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TouristLogChain {
    struct BlockRecord {
        uint256 index;
        bytes32 blockHash;
        bytes32 previousBlockHash;
        uint256 timestamp;
    }

    mapping(uint256 => BlockRecord) public blocks;
    uint256 public blockCount;

    event BlockAdded(
        uint256 indexed index,
        bytes32 indexed blockHash,
        bytes32 indexed previousBlockHash,
        uint256 timestamp
    );

    function addBlock(bytes32 blockHash, bytes32 previousBlockHash) external {
        uint256 index = blockCount;
        blocks[index] = BlockRecord({
            index: index,
            blockHash: blockHash,
            previousBlockHash: previousBlockHash,
            timestamp: block.timestamp
        });

        blockCount += 1;

        emit BlockAdded(index, blockHash, previousBlockHash, block.timestamp);
    }

    function getBlock(uint256 index) external view returns (BlockRecord memory) {
        return blocks[index];
    }
}
