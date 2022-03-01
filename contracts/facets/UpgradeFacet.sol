// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UpgradeFacet {
    event TestEvent(address something);

    function function1() external pure returns (string memory str) {
        str = "I got upgraded!";
        return str;
    }

    function function2() external pure returns (string memory str) {
        str = "I got upgraded 2!";
        return str;
    }
}
