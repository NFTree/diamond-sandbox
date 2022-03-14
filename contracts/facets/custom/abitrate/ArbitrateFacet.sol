//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../../libraries/LibDiamond.sol";
import "../sentinel/ISentinelFacet.sol";
import "../../../guardian/IGuardian.sol";


contract ArbitrateFacet {
    constructor() {}

    modifier canCall() {
        bool isGuardian = ISentinelFacet(address(this)).isGuardian(msg.sender);
        bool isAdmin = ISentinelFacet(address(this)).isAdmin(msg.sender);
        require(isGuardian || isAdmin, "Not authorized to call");
        _;
    }

    function doCall(address _contract, bytes memory _calldata) public canCall {
        // maybe add returndatacopy and result
        // _contract.delegatecall(_calldata);
        
        //Make delegate call with calldata
        IGuardian(address(this)).execute(
            _contract, //to
            0, //price
            _calldata, //calldata
            Enum.Operation.Call //0 = Call, 1 = DelegateCall
        );

        //Make delegate call with calldata
        // IGuardian(address(this)).exec(
        //     _contract, //to
        //     0, //price
        //     _calldata, //calldata
        //     Enum.Operation.DelegateCall //0 = Call, 1 = DelegateCall
        // );

        // abi.encodeCall(
        //     IGuardian(address(this)).exec,
        //     (
        //         _contract, //to
        //         0, //price
        //         _calldata, //calldata
        //         Enum.Operation.Call //0 = Call, 1 = DelegateCall
        //     )
        // );

        //Send encoded exec() call to guardian with encoded delegate call
        // delegatecall
    }
}
