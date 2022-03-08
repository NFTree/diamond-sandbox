# Diamond-1-Hardhat Implementation

Referenced from https://github.com/mudgen/diamond-1-hardhat. Please look at https://github.com/mudgen/diamond for other implementations and tradeoffs.

## Overview


## To run

0. Install dependencies
```
npm install
```

1. Create .env file and add private key for rinkeby and etherscan key. Refer to .env.example for var names

2. Deploy the initial diamond and facets:
```
npx hardhat run scripts/deploy.js --network rinkeby
```

3. Copy the diamond address

4. In scripts/upgrade_facet.js past diamond address in step 2 in var DIAMOND_ADDR

5. Run upgrade script:
```
npx hardhat run scripts/upgrade_facet.js --network rinkeby
```

This is a reference implementation for [EIP-2535 Diamonds](https://github.com/ethereum/EIPs/issues/2535). To learn about other implementations go here: https://github.com/mudgen/diamond

**Note:** In this implementation the loupe functions are NOT gas optimized. The `facets`, `facetFunctionSelectors`, `facetAddresses` loupe functions are not meant to be called on-chain and may use too much gas or run out of gas when called in on-chain transactions. In this implementation these functions should be called by off-chain software like websites and Javascript libraries etc., where gas costs do not matter.

## License

MIT license. See the license file.
Anyone can use or modify this software for their purposes.

