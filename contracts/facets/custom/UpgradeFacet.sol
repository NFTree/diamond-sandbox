// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    This is the initial facet we'll deploy to our diamond
 */
contract UpgradeFacet {
    event TestEvent(address something);

    uint public value;

    constructor() {
        value = 0;
    }

    function function1() external view returns (uint) {
        return value;
    }

    function getResponse() external pure returns (string memory) {
        return "I DO NOT LIKE GREEN EGGS AND HAM";
    }

    function setValue(uint _value) external {
        value = _value + 50;
    }
}
