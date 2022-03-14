import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FacetCutAction, getSelectors } from "../../libraries/diamond";
interface AddFacetArgs {
    guardianaddr: string, // Guardian/diamond address where the facet will be added
}

// This adds the arbitrate facet to a diamond contract
task("addArbitrateFacet", "Adds Arbitrate Facet to a guardian module")
    .addParam("guardianaddr", "Guardian contract address to add function", undefined, types.string)
    .setAction(async (args: AddFacetArgs, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre;

        const { guardianaddr } = args

        const [caller] = await ethers.getSigners();
        console.log("Using the account:", caller.address);

        console.log('');
        console.log(`Deploying Arbitrate Facet contract`);

        // 1) Deploy our the contract
        const ArbitrateFacet = await ethers.getContractFactory('ArbitrateFacet');
        const arbitrate = await ArbitrateFacet.deploy();
        await arbitrate.deployed();
        console.log(`Deployed facet to ${arbitrate.address}`);

        // 2) Add facet to guardian
        console.log('');
        console.log(`Adding facet ${arbitrate.address} to guardian`);
        const diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', guardianaddr);

        //@ts-ignore
        //We remove supportsInterface(bytes4) since it's already added in a previous facet
        //Also this isn't a function we need to expose since we delegate calls vs interacting with the function directly
        const selectors = getSelectors(arbitrate);

        let tx = await diamondCutFacet.diamondCut(
            [{
                facetAddress: arbitrate.address,
                action: FacetCutAction.Add,
                functionSelectors: selectors
            }],
            ethers.constants.AddressZero, '0x', { gasLimit: 800000 })

        let receipt = await tx.wait();
        if (!receipt.status) {
            throw Error(`Diamond upgrade failed: ${tx.hash}`)
        }

        console.log(`Completed diamond cut upgrade adding Arbitrate Facet as ${arbitrate.address}`);

        return arbitrate.address;
    });

export { };
