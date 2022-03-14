//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/gnosis/IGnosisSafe.sol";
import "../interfaces/gnosis/IGnosisSafeProxyFactory.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

//Factory contract to create gnosis safes
contract SafeFactory {
    event SafeCreated (address safe);

    address public immutable GNOSIS_SAFE_FALLBACK_HANDLER;
    // This contains the address for the proxy template
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
    function initSafe(address module) external {
        //address(this) here is the address of the safe
        //this is because this will be encoded and called in the context of the safe
        IGnosisSafe(payable(address(this))).enableModule(module);
    }

    //TODO: maybe make the guardian a proxy contract so we can deploy more lean
    function createSafe(bytes32 salt, address module) external returns (address safeAddress) {
        //1. createProxyWithNonce()
        salt = keccak256(abi.encode(salt, msg.sender, address(this)));
        IGnosisSafe safe = GNOSIS_SAFE_PROXY_FACTORY_DEPLOYER.createProxyWithNonce(GNOSIS_SAFE_SINGLETON_DEPLOYMENT, "", uint256(salt));

        //2. setup()
        address[] memory owners = new address[](1);

        // TODO: Update this to change owner. I just added my deployer address for testing purposes
        owners[0] = msg.sender;
        IGnosisSafe(address(safe)).setup(
            owners, //Owners
            1, //threshold
            address(this), //to
            abi.encodeCall(this.initSafe, (module)), // data, this will be called in the context of what is set in the 'to' param
            GNOSIS_SAFE_FALLBACK_HANDLER, //Fallback handler
            address(0), // paymentToken
            0, // payment
            payable(0) //payment receiver
        );

        emit SafeCreated(address(safe));

        return address(safe);
    }

    // Predict address of safe address using create2 standard for proxies
    function predictSafeAddress(bytes32 salt) public view returns (address predicted) {
        salt = keccak256(abi.encode(salt, msg.sender, address(this)));
        salt = keccak256(abi.encodePacked(keccak256(""), salt));
        bytes memory bytecode = abi.encodePacked(
            GNOSIS_SAFE_PROXY_FACTORY_DEPLOYER.proxyCreationCode(),
            uint256(uint160(GNOSIS_SAFE_SINGLETON_DEPLOYMENT))
        );
        predicted = Create2.computeAddress(salt, keccak256(bytecode), address(GNOSIS_SAFE_PROXY_FACTORY_DEPLOYER));
    }
}
