import { Contract, VoidSigner, ethers } from "ethers";
import {
  getChainId,
  getEip155ChainId,
  getRouteApprovalAddress,
  lifi,
  lifiBassDiamondAddress,
  usdcFromTokenAddress,
} from "../lib/lifi";
import { BigNumber } from "bignumber.js";

import { RoutesRequest } from "@lifi/sdk";

const baseRPCURL = "https://base.llamarpc.com";

export const abi = [
  {
    name: "approve",
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "allowance",
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const getProvider = (chain: string) => {
  const eip155ChainId = getEip155ChainId(chain);
  const providers = {
    "eip155:8453": "https://mainnet.base.org",
    "eip155:10": "https://optimism.llamarpc.com",
    "eip155:42161": "https://arbitrum.llamarpc.com",
  };

  const providerUrl = providers[eip155ChainId];
  if (!providerUrl) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  return new ethers.JsonRpcProvider(providerUrl);
};

// Get the current allowance and update it if needed
export const checkAllowance = async (
  verifiedETHAddress: string,
  token: string,
  fromAmount: string,
  chain: string,
  isETH: boolean = false
): Promise<{ needsApproval: boolean; approvalAddress: string }> => {
  const provider = getProvider(chain);
  const chainId = getChainId(chain);
  console.log("Checking allowance");
  console.log("Verified ETH Address", verifiedETHAddress);
  console.log("Token", token);
  console.log("From Amount", fromAmount);
  console.log("Block Number", await provider.getBlockNumber());
  console.log("Chain ID", chainId);
  // Transactions with the native token don't need approval
  if (isETH) {
    return { needsApproval: false, approvalAddress: lifiBassDiamondAddress };
  }

  const parsedFromAmount = BigNumber(fromAmount).times(1e6).toString();
  const fromTokenAddress = usdcFromTokenAddress(chainId);
  console.log("From Token Address", fromTokenAddress);

  const approvalAddress = await getRouteApprovalAddress({
    fromChainId: chainId,
    toChainId: chainId,
    fromTokenAddress: fromTokenAddress,
    fromAmount: parsedFromAmount,
    toTokenAddress: token,
  });

  const signer = new ethers.JsonRpcSigner(provider, verifiedETHAddress);
  const erc20 = new Contract(fromTokenAddress, abi, signer);
  const allowance = await erc20.allowance(verifiedETHAddress, approvalAddress);
  console.log("Allowance", allowance.toString());
  console.log(allowance);

  if (Number(allowance) < Number(parsedFromAmount)) {
    console.log("Allowance is less than parsedFromAmount");
    return { needsApproval: true, approvalAddress };
    //     const approveTx = await erc20.approve(approvalAddress, amount);
    //     await approveTx.wait();
  } else {
    console.log("Allowance is greater than parsedFromAmount");
    return { needsApproval: false, approvalAddress };
  }
};

// await checkAndSetAllowance(
//   wallet,
//   quote.action.fromToken.address,
//   quote.estimate.approvalAddress,
// );
