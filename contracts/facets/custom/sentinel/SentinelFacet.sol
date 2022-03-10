//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@gnus.ai/contracts-upgradeable-diamond/access/AccessControlEnumerableUpgradeable.sol";
import {AccessControlEnumerableStorage} from "@gnus.ai/contracts-upgradeable-diamond/access/AccessControlEnumerableStorage.sol";
import {AccessControlStorage} from "@gnus.ai/contracts-upgradeable-diamond/access/AccessControlStorage.sol";

// This contract gives permissions to certain contracts.
// This can be used with other contracts to restrict permissions to a set of addresses

contract SentinelFacet is AccessControlEnumerableUpgradeable {
    using AccessControlEnumerableStorage for AccessControlEnumerableStorage.Layout;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    // Unsure if this will clash with any storage in other facets
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN");

    constructor() {}

    // per https://www.npmjs.com/package/@gnus.ai/contracts-upgradeable-diamond
    // we call initialize here
    // we might need to name this somehting else
    // if there are multiple upgradeable facets, this will potentially clash signature
    function initialize(address root) public initializer {
        // Unsure if this necessary since theres no real logic associated with this
        __AccessControlEnumerable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, root);

        //Let the admin grant/revert the guardian role
        _setRoleAdmin(GUARDIAN_ROLE, DEFAULT_ADMIN_ROLE);
    }

    /// @dev Restricted to members of the admin role.
    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Restricted to admins.");
        _;
    }

    /// @dev Return `true` if the account belongs to the admin role.
    function isAdmin(address account) public view virtual returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    function isGuardian(address account) public view virtual returns (bool) {
        return hasRole(GUARDIAN_ROLE, account);
    }

    function addGuardian(address account) public virtual onlyAdmin {
        grantRole(GUARDIAN_ROLE, account);
    }

    function removeGuardian(address account) public virtual onlyAdmin {
        revokeRole(GUARDIAN_ROLE, account);
    }
}
