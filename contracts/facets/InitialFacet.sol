// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    This is the initial facet we'll deploy to our diamond
 */
contract InitialFacet {
    event TestEvent(address something);

    function function1() external pure returns (string memory str) {
        str = "Hello World I am initial";
        return str;
    }

    function function2() external pure returns (string memory str) {
        str = "Hello world I am initial 2";
        return str;
    }
}
