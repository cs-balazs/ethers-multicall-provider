import { BlockTag, ContractRunner, isHexString, toNumber } from "ethers";
import { add } from "lodash";

import {
  multicall2Address,
  multicall2DeploymentBlockNumbers,
  multicall3Address,
  multicall3ChainAddress,
  multicall3DeploymentBlockNumbers,
} from "./constants";
import { Multicall2__factory, Multicall3__factory } from "./types";

export enum MulticallVersion {
  V2 = "2",
  V3 = "3",
}

export const getBlockNumber = (blockTag: BlockTag) => {
  if (isHexString(blockTag)) return parseInt(blockTag as string, 16);
  else if (typeof blockTag === "bigint") return toNumber(blockTag);
  else if (typeof blockTag === "number") return blockTag;
  else if (blockTag === "earliest") return 0;

  return null;
};

export const getMulticall = (
  blockNumber: number | null,
  chainId: number,
  runner: ContractRunner,
  addressToUse?: { v2: string } | { v3: string }
) => {
  if (addressToUse && "v3" in addressToUse) {
    return Multicall3__factory.connect(addressToUse.v3, runner);
  }

  if (multicall3DeploymentBlockNumbers[chainId]) {
    // Check blockNumber?
    return Multicall3__factory.connect(
      multicall3ChainAddress[chainId] || multicall3Address,
      runner
    );
  }

  if (addressToUse && "v2" in addressToUse) {
    return Multicall2__factory.connect(addressToUse.v2, runner);
  }

  if (blockNumber != null) {
    if (blockNumber <= (multicall3DeploymentBlockNumbers[chainId] ?? Infinity)) {
      if (blockNumber <= (multicall2DeploymentBlockNumbers[chainId] ?? Infinity)) return null;

      return Multicall2__factory.connect(multicall2Address, runner);
    }
  }

  return Multicall3__factory.connect(multicall3ChainAddress[chainId] || multicall3Address, runner);
};
