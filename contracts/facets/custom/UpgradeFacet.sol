// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    This is the initial facet we'll deploy to our diamond
 */
contract UpgradeFacet {
    event TestEvent(address something);

    uint public value;
    uint internal value2;

    constructor() {
        value = 0;
        value2 = 555;
    }

    function function1() external view returns (uint) {
        return value2;
    }

    function getResponse() external pure returns (string memory) {
        return "I DO NOT LIKE GREEN EGGS AND HAM";
    }

    function setValue(uint _value) external {
        value = _value + 50;
    }
}
