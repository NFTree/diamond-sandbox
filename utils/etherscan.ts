import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export async function verifyEtherscanUsingHardhat(
    hre: HardhatRuntimeEnvironment,
    address: string,
    constructorArguments: string[],
    attempt = 0,
    contract: undefined | string = undefined
) {
    try {
        await hre.run("verify:verify", { address, constructorArguments, contract });
    } catch (e) {
        // Don't throw if the error is that the source is already verified.
        if (e instanceof NomicLabsHardhatPluginError) {
            const { message } = e;
            if (message == "Contract source code already verified") {
                console.log(
                    `Source for contract ${address} already verified on etherscan`
                );
                return;
            }
            if (message.includes("Failed to send contract verification request")) {
                console.log(
                    `Failed to send etherscan verification request for address ${address}; attempt ${attempt}`
                );
                if (attempt < 10) {
                    await sleep(10);
                    await verifyEtherscanUsingHardhat(
                        hre,
                        address,
                        constructorArguments,
                        attempt + 1,
                        contract
                    );
                    return;
                }
            }
            if (message.includes("Already Verified")) {
                console.log(`Etherscan already verified for address ${address}`);
                return;
            }
        }
        throw e;
    }
}