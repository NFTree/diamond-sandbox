//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// This contract gives permissions to certain contracts.
// This can be used with other contracts to restrict permissions to a set of addresses

contract ISentinelFacet {
    // per https://www.npmjs.com/package/@gnus.ai/contracts-upgradeable-diamond
    // we call initialize here
    // we might need to name this somehting else
    // if there are multiple upgradeable facets, this will potentially clash signature
    function initialize(address root) public virtual {}

    /// @dev Return `true` if the account belongs to the admin role.
    function isAdmin(address account) public view virtual returns (bool) {}

    function isGuardian(address account) public view virtual returns (bool) {}

    function addGuardian(address account) public virtual {}

    function removeGuardian(address account) public virtual {}
}
