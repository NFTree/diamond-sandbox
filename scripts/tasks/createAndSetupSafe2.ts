import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getFallbackHandlerDeployment, getProxyFactoryDeployment, getSafeSingletonDeployment } from "@gnosis.pm/safe-deployments";

interface TaskArgs {
    name: string
    moduleaddress: string
}

//Deploys a gnosis safe
task("createAndSetupSafe2", "Creates a gnosis safe wallet")
    .addParam("name", "Name for this safe", undefined, types.string)
    .addParam("moduleaddress", "Address of module to setup with our safe", undefined, types.string)
    .setAction(async (args: TaskArgs, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre;
        const [caller] = await ethers.getSigners();

        console.log('Starting creating proxy')

        //This is initializer data to setup and initialize the safe after deployment
        const gnosisSafeIface = new ethers.utils.Interface(getSafeSingletonDeployment()!.abi);
        const setupData = gnosisSafeIface.encodeFunctionData("setup", [[caller.address], 1, ethers.constants.AddressZero, "0x", getFallbackHandlerDeployment()?.networkAddresses["4"], ethers.constants.AddressZero, 0, ethers.constants.AddressZero]);

        const templateAddr = getSafeSingletonDeployment()!.networkAddresses["4"];
        const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string", "address[]"], [args.name, [caller.address]]));

        const proxyFactoryData = getProxyFactoryDeployment();
        const proxyFactoryAddress = proxyFactoryData!.networkAddresses["4"];
        const proxyFactory = new ethers.Contract(proxyFactoryAddress, proxyFactoryData!.abi, caller);
        const safeTxn = await proxyFactory.createProxyWithNonce(
            templateAddr, //Proxy template to reference
            setupData, //Initializer data after deploy
            salt //Determines proxy address
        )

        let safeReceipt = await safeTxn.wait();
        if (!safeReceipt.status) {
            throw Error(`Gnosis safe create failed: ${safeTxn.hash}`)
        }

        console.log('Finish creating gnosis safe')
        //Get the event emitted which includes the safe address that was deployed
        const safeAddress = safeReceipt.events[0].address;
        console.log(`Created safe at ${safeAddress}`);

        //Create encoded enableModule() call
        const safeIface = new ethers.utils.Interface(getSafeSingletonDeployment()!.abi);
        const enableData = safeIface.encodeFunctionData("enableModule", [args.moduleaddress]);

        const safe = await ethers.getContractAt(getSafeSingletonDeployment()!.abi, safeAddress, caller);

        //Unsure but this seems to be the schema for adding modules
        const signature = "0x000000000000000000000000" + caller.address.slice(2) + "000000000000000000000000000000000000000000000000000000000000000001";
        const enableTxn = await safe.execTransaction(
            safeAddress, //to
            0, //value
            enableData, //data 
            0, //operation
            0, //safeTxGas
            0, //baseGas
            0, //gasPrice
            ethers.constants.AddressZero, //gasToken
            ethers.constants.AddressZero, //refundReceiver
            signature //signatures
        )
        const enableReceipt = await enableTxn.wait();
        if (!enableReceipt.status) {
            throw Error(`Could not enable module on safe: ${enableTxn.hash}`)
        }

        return safeAddress;
    });

export { };