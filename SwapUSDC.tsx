/** @jsxImportSource frog/jsx */
import React from "react";
import {
  ethFromTokenAddress,
  getChainId,
  getEip155ChainId,
  getRecommendedQuoteCallData,
  lifi,
  usdcFromTokenAddress,
} from "../lib/lifi";
import {
  Button,
  Frog,
  FrameContext,
  TextInput,
  TransactionContext,
} from "frog";
import { parseEther } from "viem";
import { Env } from "hono";
import { BigNumber } from "bignumber.js";
import { type State } from "../app/api/[[...routes]]/route";
import { getFirstVerifiedETHAddressByFid } from "../actions/fetch-eth-verified-address-for-fid";
import { checkAllowance } from "../actions/get-approval";
import { QuoteRequest } from "@lifi/sdk";
import StyledTextImage from "../components/StyledTextImage";
import { renderChart } from "@/components/ChartImage";
import { ethers } from "ethers";

export const SwapUSDCFrame = async (
  app: Frog<Env & { State: State }, {}, "/swap/usdc/:chain/:token">
) => {
  app.frame("/swap/usdc/:chain/:token", async (c) => {
    console.log("loading swap usdc frame");
    const token = c.req.param("token");
    const chain = c.req.param("chain");
    const { inputText, status, deriveState } = c;
    console.log("inputText", inputText);

    const fromAmount = inputText;
    let state = c.deriveState((previousState) => {
      if (previousState.fromAmount !== fromAmount && fromAmount) {
        previousState.fromAmount = fromAmount;
      }
      if (previousState.chain !== chain && chain) {
        previousState.chain = chain;
      }
      if (previousState.token !== token && token) {
        previousState.token = token;
      }
    });

    if (!fromAmount) {
      const base64Image = await renderChart(chain, token); // Ensure renderChart is

      if (!base64Image) {
        return c.res({
          image: (
            <StyledTextImage message={`Could not find price chart for token`} />
          ),
          intents: [
            <TextInput placeholder="How much do you want to spend?" />,
            <Button action={`/swap/usdc/${state.chain}/${state.token}`}>
              Ape with USDC
            </Button>,
          ],
        });
      }

      return c.res({
        image: base64Image,
        intents: [
          <TextInput placeholder="How much do you want to spend?" />,
          <Button action={`/swap/usdc/${state.chain}/${state.token}`}>
            Ape with USDC
          </Button>,
        ],
      });
    }

    if (!c.frameData?.fid) {
      return c.res({
        image: <StyledTextImage message={`Please verify your wallet`} />,
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

    const { needsApproval, approvalAddress } = await checkAllowance(
      verifiedETHAddress,
      token,
      fromAmount,
      chain
    );

    state = c.deriveState((previousState) => {
      if (previousState.fromAmount !== fromAmount && fromAmount) {
        previousState.fromAmount = fromAmount;
      }
      if (previousState.chain !== chain && chain) {
        previousState.chain = chain;
      }
      if (previousState.token !== token && token) {
        previousState.token = token;
      }
      if (
        previousState.approvalAddress !== approvalAddress &&
        approvalAddress
      ) {
        previousState.approvalAddress = approvalAddress;
      }
    });
    console.log("state", state);

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
  });
};

export const SwapUSDCTransactionFrame = async (
  app: Frog<
    Env & { State: State },
    {},
    "/swap/usdc/:chain/:token/:fromAmount/:toAddress"
  >
) => {
  app.transaction(
    "/swap/usdc/:chain/:token/:fromAmount/:toAddress",
    async (c) => {
      const { fromAmount, toAddress, chain, token } = c.req.param();

      const chainId = getChainId(chain);
      const eip155ChainId = getEip155ChainId(chain);

      const quoteRequest: QuoteRequest = {
        fromChain: chainId,
        fromToken: usdcFromTokenAddress(chainId),
        fromAddress: c.address, // Connected address
        fromAmount: BigNumber(fromAmount).times(1e6).toString(),
        toChain: chainId,
        toToken: token,
      };

      console.log("quoteRequest", quoteRequest);
      const quoteCallData = await getRecommendedQuoteCallData(quoteRequest);
      console.log("quoteCallData", quoteCallData?.slice(0, 10) + "...");

      return c.send({
        data: quoteCallData as `0x${string}`,
        chainId: eip155ChainId,
        to: toAddress as `0x${string}`,
      });
    }
  );
};
