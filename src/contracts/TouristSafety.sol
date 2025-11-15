// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TouristSafety {

    struct User {
        string name;
        string encryptedPrivateKey; // only user-encrypted, no raw key
        bool registered;
    }

    struct EmergencyLog {
        uint timestamp;
        string location;  // encrypted GPS or hashed GPS
        string threatLevel;
    }

    mapping(address => User) public users;
    mapping(address => EmergencyLog[]) public logs;
    mapping(address => address) public policeAccess; // tourist → police station

    event UserRegistered(address user);
    event EmergencyLogged(address user, uint timestamp, string location);
    event PoliceAccessGranted(address user, address police);

    function registerUser(
        string memory name,
        string memory encryptedKey
    ) public {
        require(!users[msg.sender].registered, "Already registered");

        users[msg.sender] = User(
            name,
            encryptedKey,
            true
        );

        emit UserRegistered(msg.sender);
    }

    function addEmergencyLog(
        string memory encryptedLocation,
        string memory threatLevel
    ) public {
        require(users[msg.sender].registered, "User not registered");

        logs[msg.sender].push(
            EmergencyLog(block.timestamp, encryptedLocation, threatLevel)
        );

        emit EmergencyLogged(msg.sender, block.timestamp, encryptedLocation);
    }

    function grantPoliceAccess(address policeStation) public {
        require(users[msg.sender].registered, "User not registered");
        policeAccess[msg.sender] = policeStation;

        emit PoliceAccessGranted(msg.sender, policeStation);
    }
}
