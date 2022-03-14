//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../../libraries/LibDiamond.sol";
import "../sentinel/ISentinelFacet.sol";
import "../../../guardian/IGuardian.sol";

// This facet allows any set sentinels to make calls to any contract through the gnosis safe
contract ArbitrateFacet {
    event CallAbitrated (
        address indexed _abitrator,
        address _to,
        bytes _calldata
    );

    constructor() {}

    //This checks if the caller is a guardian or admin address
    modifier canCall() {
        bool isGuardian = ISentinelFacet(address(this)).isGuardian(msg.sender);
        bool isAdmin = ISentinelFacet(address(this)).isAdmin(msg.sender);
        require(isGuardian || isAdmin, "Not authorized to call");
        _;
    }

    // This is the public call for people to execute transactions
    function doCall(address _contract, bytes memory _calldata) public canCall {
        IGuardian(address(this)).execute(
            _contract, //to
            0, //price
            _calldata, //calldata
            Enum.Operation.Call //0 = Call, 1 = DelegateCall
        );

        emit CallAbitrated(msg.sender, _contract, _calldata);
    }
}
