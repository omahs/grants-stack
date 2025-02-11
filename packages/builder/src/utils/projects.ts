import { ethers } from "ethers";
import { ChainId } from "common";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import { getProviderByChainId } from "./utils";
import { addressesByChainID } from "../contracts/deployments";

// eslint-disable-next-line import/prefer-default-export
export const fetchProjectOwners = (chainID: ChainId, projectID: string) => {
  const addresses = addressesByChainID(chainID);
  const appProvider = getProviderByChainId(chainID);

  const projectRegistry = new ethers.Contract(
    addresses.projectRegistry!,
    ProjectRegistryABI,
    appProvider
  );

  return projectRegistry.getProjectOwners(projectID);
};
