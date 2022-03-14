import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FacetCutAction, getSelectors } from "../../libraries/diamond";
interface AddFacetArgs {
    guardianaddr: string, // Guardian/diamond address where the facet will be added
    adminaddr: string, // The address that will be the admin to our Sentinel facet
}

// This adds a facet to a diamond contract
task("addSentinelFacet", "Adds Sentinel Facet to a guardian module")
    .addParam("guardianaddr", "Guardian contract address to add function", undefined, types.string)
    .addParam("adminaddr", "admin address to set on Sentinel", undefined, types.string)
    .setAction(async (args: AddFacetArgs, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre;

        const { guardianaddr, adminaddr } = args

        const [caller] = await ethers.getSigners();
        console.log("Using the account:", caller.address);

        console.log('');
        console.log(`Deploying Sentinel Facet contract`);
        console.log(`admin is: ${adminaddr}`)

        // 1) Deploy our the contract
        const SentinelFacet = await ethers.getContractFactory('SentinelFacet');
        // const sentinel = await SentinelFacet.deploy(adminaddr);
        const sentinel = await SentinelFacet.deploy();
        await sentinel.deployed();
        // await sentinel.initialize(adminaddr);
        console.log(`Deployed facet to ${sentinel.address}`);

        // 2) Add facet to guardian
        console.log('');
        console.log(`Adding facet ${sentinel.address} to guardian`);
        const diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', guardianaddr);
        
        //@ts-ignore
        //We remove supportsInterface(bytes4) since it's already added in a previous facet
        //Also this isn't a function we need to expose since we delegate calls vs interacting with the function directly
        const selectors = getSelectors(sentinel).remove(['supportsInterface(bytes4)']);
        
        let tx = await diamondCutFacet.diamondCut(
            [{
                facetAddress: sentinel.address,
                action: FacetCutAction.Add,
                functionSelectors: selectors
            }],
            ethers.constants.AddressZero, '0x', { gasLimit: 800000 })

        let receipt = await tx.wait();
        if (!receipt.status) {
            throw Error(`Diamond upgrade failed: ${tx.hash}`)
        }

        console.log(`Completed diamond cut upgrade adding Sentinel Facet as ${sentinel.address}`);

        // 3) initialize the sentinel
        // NOTE: we do this in the context of the guardian address since we're using diamond storage
        console.log(`Initializing facet ${sentinel.address}`);
        const guardian = await ethers.getContractAt('SentinelFacet', guardianaddr);
        let initTx = await guardian.initialize(adminaddr);

        let initReceipt = await initTx.wait();
        if (!initReceipt.status) {
            throw Error(`Sentinel init failed: ${initTx.hash}`)
        }
        console.log('Done initialize');

        return sentinel.address;
    });

export { };
