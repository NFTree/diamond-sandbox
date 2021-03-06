// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@gnosis.pm/zodiac/contracts/core/Module.sol";

import {LibDiamond} from "../libraries/LibDiamond.sol";
import {IDiamondCut} from "../interfaces/IDiamondCut.sol";
import "../facets/custom/sentinel/ISentinelFacet.sol";

// Guardian diamond contract
// we inherit Module so it can be added to Gnosis safes via zodiac
contract Guardian is Module {

    constructor(address _contractOwner, address _diamondCutFacet, address safe) payable {
        //Boilerplate for diamond.sol
        LibDiamond.setContractOwner(_contractOwner);

        // Add the diamondCut external function from the diamondCutFacet
        // This will add functions that can modify facets later
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        bytes4[] memory functionSelectors = new bytes4[](1);
        functionSelectors[0] = IDiamondCut.diamondCut.selector;
        cut[0] = IDiamondCut.FacetCut({facetAddress: _diamondCutFacet, action: IDiamondCut.FacetCutAction.Add, functionSelectors: functionSelectors});
        LibDiamond.diamondCut(cut, address(0), "");

        //Boilerplate for Module.sol
        bytes memory initializeParams = abi.encode(safe);
        setUp(initializeParams);
    }

    // Boilerplate for Module.sol
    /// @dev Initialize function, will be triggered when a new proxy is deployed
    /// @param initializeParams Parameters of initialization encoded
    function setUp(bytes memory initializeParams) public override initializer {
        __Ownable_init();
        address _owner = abi.decode(initializeParams, (address));

        // This sets where calls from modules are fowarded (eg: calls fowarded to the safe)
        setAvatar(_owner);
        setTarget(_owner);
        transferOwnership(_owner);
    }

    // Boilerplate for diamond.sol
    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds;
        bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
        // get diamond storage
        assembly {
            ds.slot := position
        }
        // get facet from function selector
        address facet = ds.facetAddressAndSelectorPosition[msg.sig].facetAddress;
        require(facet != address(0), "Diamond: Function does not exist");
        // Execute external function from facet using delegatecall and return any value.
        assembly {
            // copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
            // execute function call using the facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            // get any return value
            returndatacopy(0, 0, returndatasize())
            // return any return value or error back to the caller
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    // We need to expose this since exec() in Module is internal so our ArbitrateFacet can call itself
    function execute(
        address _to,
        uint256 _value,
        bytes memory _data,
        Enum.Operation _operation
    ) public returns (bool success) {
        // Only allow this to call itself since any call to a facet should be to the guardian contract address
        require(address(this) == msg.sender, 'Call only allowed from guardian or facet contracts');
        
        success = exec(_to, _value, _data, _operation);
        return success;
    }

    //Boilerplate for diamond.sol
    receive() external payable {}
}
