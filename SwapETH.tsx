/** @jsxImportSource frog/jsx */
import React from "react";
import {
  ethFromTokenAddress,
  getChainId,
  getEip155ChainId,
  getRecommendedQuoteCallData,
  lifi,
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

export const SwapETHFrame = async (
  app: Frog<Env & { State: State }, {}, "/swap/eth/:chain/:token">
) => {
  app.frame("/swap/eth/:chain/:token", async (c) => {
    console.log("loading swap eth frame");
    const { inputText, status } = c;
    console.log("inputText", inputText);
    const { chain, token } = c.req.param();

    if (!inputText) {
      const base64Image = await renderChart(chain, token); // Ensure renderChart is

      // NOTE - all this is WIP, working on the usdc route for now

      if (!base64Image) {
        return c.res({
          image: (
            <div style={{ fontSize: 60 }}>
              Could not find price chart for token
            </div>
          ),
          intents: [
            <TextInput placeholder="How much do you want to spend?" />,
            <Button action={`/swap/eth/${chain}/${token}`}>
              Ape with ETH
            </Button>,
          ],
        });
      }

      return c.res({
        image: base64Image,
        intents: [
          <TextInput placeholder="How much do you want to spend?" />,
          <Button action={`/swap/eth/${chain}/${token}`}>Ape with ETH</Button>,
        ],
      });
    }

    const fromAmount = inputText;

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
    if (!verifiedETHAddress) {
      return c.res({
        image: <StyledTextImage message={`Please verify your wallet`} />,
        intents: [<Button.Redirect location="/verify">Verify</Button.Redirect>],
      });
    }
    const { approvalAddress } = await checkAllowance(
      verifiedETHAddress,
      token,
      fromAmount,
      chain,
      true // isETH
    );
    console.log("approvalAddress", approvalAddress);
    const state = c.deriveState((previousState) => {
      if (previousState.chain !== chain && chain) {
        previousState.chain = chain;
      }
      if (previousState.token !== token && token) {
        previousState.token = token;
      }
      if (previousState.fromAmount !== fromAmount && fromAmount) {
        previousState.fromAmount = fromAmount;
      }
      if (
        previousState.approvalAddress !== approvalAddress &&
        approvalAddress
      ) {
        previousState.approvalAddress = approvalAddress;
      }
    });
    console.log("state", state);
    return c.res({
      action: `/find-swap/eth`,
      image: (
        <StyledTextImage
          message={`You want to ape ${state.fromAmount} ETH into ${state.token}`}
        />
      ),
      intents: [
        <Button.Transaction
          // NOTE - we are using the lifi diamond as the toAddress here as it is also the approvalAddress that we have persisted in state
          target={`/swap/eth/${state.chain}/${state.token}/${state.fromAmount}/${state.approvalAddress}`}
        >
          Swap with ETH
        </Button.Transaction>,
      ],
    });
  });
};
export const SwapETHTransactionFrame = async (
  app: Frog<
    Env & { State: State },
    {},
    "/swap/eth/:chain/:token/:fromAmount/:toAddress"
  >
) => {
  app.transaction(
    "/swap/eth/:chain/:token/:fromAmount/:toAddress",
    async (c) => {
      // TODO: GET the quote then return the calldata from the tx request into the c.send

      // TODO: findSwapeth.tsx for seeing if the txhash has mined
      // NOTE - might have to split state.txHash into its own field for approvalTxHash and swapTxHash
      // cause right now it's using one that'll conflict on the findSwapeth.tsx

      const { fromAmount, toAddress, chain, token } = c.req.param();
      console.log("params", { fromAmount, toAddress, chain, token });

      const chainId = getChainId(chain);
      const eip155ChainId = getEip155ChainId(chain);

      const quoteRequest: QuoteRequest = {
        fromChain: chainId,
        fromToken: ethFromTokenAddress,
        fromAddress: c.address, // Connected address
        fromAmount: BigNumber(fromAmount).times(1e18).toString(),
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
        value: parseEther(fromAmount),
      });
    }
  );
};
