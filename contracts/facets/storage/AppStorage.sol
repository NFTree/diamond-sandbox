// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// This follows the AppStorage pattern described in https://dev.to/mudgen/appstorage-pattern-for-state-variables-in-solidity-3lki
struct AppStorage {
    uint globalNumber;
    string globalString;
    address globalAddress;
}