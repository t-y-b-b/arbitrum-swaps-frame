/** @jsxImportSource frog/jsx */
import React from "react";
import {
  usdcFromTokenAddress,
  lifi,
  getChainId,
  getEip155ChainId,
} from "../lib/lifi";
import { Button, Frog, FrameContext, TextInput } from "frog";
import { Env } from "hono";
import { getFirstVerifiedETHAddressByFid } from "../actions/fetch-eth-verified-address-for-fid";
import { abi, checkAllowance } from "../actions/get-approval";
import { TransactionContext } from "frog/edge";
import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { renderChart } from "../components/ChartImage";
import { State } from "@/app/api/[[...routes]]/route";
import StyledTextImage from "@/components/StyledTextImage";

export const approveUSDCHandler = async (
  c: FrameContext<Env & { State: State }, "/approve/:chain/:token/usdc">
) => {
  const { inputText, status, deriveState } = c;
  const { chain, token } = c.req.param();
  let state = c.deriveState((previousState) => {
    if (previousState.chain !== chain && chain) {
      previousState.chain = chain;
    }
    if (previousState.token !== token && token) {
      previousState.token = token;
    }
  });
  console.log("inputText", inputText);

  if (!c.frameData?.fid) {
    return c.res({
      image: <div style={{ fontSize: 60 }}>Please verify your wallet</div>,
      intents: [
        // TODO: find the warpcast verify link
        <Button.Redirect location="/verify">Verify</Button.Redirect>,
      ],
    });
  }
  const verifiedETHAddress = await getFirstVerifiedETHAddressByFid(
    c.frameData?.fid
  );
  console.log("verifiedETHAddress", verifiedETHAddress);

  if (!verifiedETHAddress) {
    return c.res({
      image: <StyledTextImage message={`Please verify your wallet`} />,
      intents: [<Button.Redirect location="/verify">Verify</Button.Redirect>],
    });
  }

  if (!inputText) {
    const base64Image = await renderChart(state.chain, state.token); // Ensure renderChart is

    if (!base64Image) {
      return c.res({
        image: (
          <StyledTextImage message={`Could not find price chart for token`} />
        ),
        intents: [
          <TextInput placeholder="How much do you want to spend?" />,
          <Button action={`/${state.chain}/${state.token}/usdc`}>
            Ape with USDC
          </Button>,
        ],
      });
    }

    return c.res({
      image: base64Image,
      intents: [
        <TextInput placeholder="How much do you want to spend?" />,
        <Button action={`/${state.chain}/${state.token}/usdc`}>
          Ape with USDC
        </Button>,
      ],
    });
  }

  // NOTE - Multiply by 10^6 for decimals
  const fromAmount = inputText;

  const { needsApproval, approvalAddress } = await checkAllowance(
    verifiedETHAddress,
    token,
    fromAmount,
    chain
  );

  state = c.deriveState((previousState) => {
    if (previousState.chain !== chain && chain) {
      previousState.chain = chain;
    }
    if (previousState.token !== token && token) {
      previousState.token = token;
    }
    if (previousState.fromAmount !== fromAmount && fromAmount) {
      console.log("fromAmount", fromAmount);
      previousState.fromAmount = fromAmount;
    }
    if (previousState.approvalAddress !== approvalAddress && approvalAddress) {
      previousState.approvalAddress = approvalAddress;
    }
  });

  if (needsApproval) {
    return c.res({
      action: `/find-approval/usdc`,
      image: <StyledTextImage message={`Approving USDC`} />,
      intents: [
        <Button.Transaction
          target={`/approve/usdc/${state.chain}/${state.approvalAddress}/${state.fromAmount}`}
        >
          Approve
        </Button.Transaction>,
        <Button.Transaction
          target={`/approve/usdc/${state.chain}/${
            state.approvalAddress
          }/${ethers.MaxUint256.toString()}`}
        >
          Infinite Approve
        </Button.Transaction>,
      ],
    });
  }

  return c.res({
    action: `/find-swap/usdc`,
    image: (
      <StyledTextImage
        message={`You want to ape ${state.fromAmount} USDC into ${state.token}`}
      />
    ),
    intents: [
      <Button.Transaction
        // NOTE - we are using the lifi diamond as the toAddress here as it is also the approvalAddress that we have persisted in state
        target={`/swap/usdc/${state.chain}/${state.token}/${state.fromAmount}/${state.approvalAddress}`}
      >
        Swap with USDC
      </Button.Transaction>,
    ],
  });
};

export const approveUSDCTransactionHandler = async (
  c: TransactionContext<
    Env,
    "/approve/usdc/:chain/:approvalAddress/:fromAmount"
  >
) => {
  const { approvalAddress, fromAmount, chain } = c.req.param();
  const chainId = getChainId(chain);
  console.log("chainId", chainId);

  return c.contract({
    abi: abi,
    functionName: "approve",
    args: [
      approvalAddress,
      fromAmount === ethers.MaxUint256.toString()
        ? ethers.MaxUint256
        : BigNumber(fromAmount).times(1e6).toNumber(),
    ],
    chainId: getEip155ChainId(chain),
    to: usdcFromTokenAddress(chainId) as `0x${string}`,
  });
};

export const ApproveUSDCFrame = async (
  app: Frog<
    Env & { State: State },
    {},
    "/approve/usdc/:chain/:approvalAddress/:fromAmount"
  >
) => {
  app.frame(
    "/approve/usdc/:chain/:approvalAddress/:fromAmount",
    approveUSDCHandler
  );
};

export const ApproveUSDCTransactionFrame = async (
  app: Frog<
    Env & { State: State },
    {},
    "/approve/usdc/:chain/:approvalAddress/:fromAmount"
  >
) => {
  app.transaction(
    "/approve/usdc/:chain/:approvalAddress/:fromAmount",
    approveUSDCTransactionHandler
  );
};
