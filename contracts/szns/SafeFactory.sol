//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/gnosis/IGnosisSafe.sol";
import "../interfaces/gnosis/IGnosisSafeProxyFactory.sol";

//Factory to create gnosis safes
contract SafeFactory {
    // event SafeCreated {

    // }

    address public immutable GNOSIS_SAFE_FALLBACK_HANDLER;
    address public immutable GNOSIS_SAFE_SINGLETON_DEPLOYMENT;
    // This is called to deploy safe proxies
    IGnosisSafeProxyFactory public immutable GNOSIS_SAFE_PROXY_FACTORY_DEPLOYER;

    constructor(
        address _safeFallbackHandlerAddress,
        address _safeProxyFactoryDeployerAddress,
        address _safeSingletonDeploymentAddress
    ) {
        GNOSIS_SAFE_FALLBACK_HANDLER = _safeFallbackHandlerAddress;
        GNOSIS_SAFE_SINGLETON_DEPLOYMENT = _safeSingletonDeploymentAddress;
        GNOSIS_SAFE_PROXY_FACTORY_DEPLOYER = IGnosisSafeProxyFactory(_safeProxyFactoryDeployerAddress);
    }

    // Function that will enable a module on this safe
    function initSafe() external {
        //address(this) here is the address of the safe
        //this is because this will be encoded and called in the context of the safe
        IGnosisSafe(payable(address(this))).enableModule(0x7Ffb3704Fd6FA67303235E3af22238a570f8bef4);
    }

    function createSafe(bytes32 salt) external returns (address safeAddress) {
        //1. createProxyWithNonce()
        salt = keccak256(abi.encode(salt, msg.sender, address(this)));
        IGnosisSafe safe = GNOSIS_SAFE_PROXY_FACTORY_DEPLOYER.createProxyWithNonce(GNOSIS_SAFE_SINGLETON_DEPLOYMENT, "", uint256(salt));
        
        //2. setup()
        address[] memory owners = new address[](1);
        
        // Update this to change owner. I just added my deployer address for testing purposes
        owners[0] = 0x607dd6919b920309BF760376237C9b23A42979dA;
        IGnosisSafe(address(safe)).setup(
            owners, //Owners
            1, //threshold
            address(this), //to
            abi.encodeCall(this.initSafe, ()), // data, this will be called in the context of what is set in the 'to' param
            GNOSIS_SAFE_FALLBACK_HANDLER, //Fallback handler
            address(0), // paymentToken
            0, // payment
            payable(0) //payment receiver
        );

        return address(safe);
    }
}
