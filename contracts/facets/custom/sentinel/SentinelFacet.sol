//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

// This contract gives permissions to certain contracts.
// This can be used with other contracts to restrict permissions to a set of addresses

contract SentinelFacet is AccessControlEnumerable {
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN");

    /// @dev Add `root` to the admin role as a member.
    constructor(address root) {
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
