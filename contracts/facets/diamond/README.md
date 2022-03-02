# Diamond Boilerplate facets

Contracts in this folder are boilerplate facets from https://github.com/mudgen/diamond-1-hardhat to implement the diamond pattern.

## Overview

### DiamondCuteFacet.sol
This facet contains the diamondCut() function that can (un)register functions by their selectors and contract addresses.

### DiamondLoupeFacet.sol
This facet contains helper functions to determine facets and corresponding functions defined in our diamond.

### OwnershipFacet.sol
This facet contains helper functions to determine and set ownership to our diamond. Ownership information is stored in state variable via the Diamond Storage pattern.

