//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@gnus.ai/contracts-upgradeable-diamond/access/AccessControlEnumerableUpgradeable.sol";

// This contract gives permissions to certain contracts.
// This can be used with other contracts to restrict permissions to a set of addresses

contract SentinelFacet is AccessControlEnumerableUpgradeable {
    // bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN");

    // /// @dev Add `root` to the admin role as a member.
    // constructor(address root) {
    //     _grantRole(DEFAULT_ADMIN_ROLE, root);

    //     //Let the admin grant/revert the guardian role
    //     _setRoleAdmin(GUARDIAN_ROLE, DEFAULT_ADMIN_ROLE);
    // }

    constructor() {}

    // per https://www.npmjs.com/package/@gnus.ai/contracts-upgradeable-diamond
    // we call initialize here
    function initialize(address root) initializer public {
        __AccessControlEnumerable_init_unchained();

        _grantRole(DEFAULT_ADMIN_ROLE, root);

        //Let the admin grant/revert the guardian role
        _setRoleAdmin(keccak256("GUARDIAN"), DEFAULT_ADMIN_ROLE);
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
        return hasRole(keccak256("GUARDIAN"), account);
    }

    function addGuardian(address account) public virtual onlyAdmin {
        grantRole(keccak256("GUARDIAN"), account);
    }

    function removeGuardian(address account) public virtual onlyAdmin {
        revokeRole(keccak256("GUARDIAN"), account);
    }
}
