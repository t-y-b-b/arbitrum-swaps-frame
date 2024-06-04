/** @jsxImportSource frog/jsx */
import React from "react";
import { Button, Frog, FrameContext, TextInput } from "frog";
import { Env } from "hono";
import { type State } from "../app/api/[[...routes]]/route";
import { chainIdToExplorerUrl } from "@/lib/lifi";
import { chainIdMap } from "@/actions/ticker-to-address";

export const findUSDCSwapHandler = async (
  c: FrameContext<Env & { State: State }, "/find-swap/usdc">
) => {
  const { frameData, buttonValue, inputText, deriveState, transactionId } = c;

  let swapIndexed = false;

  const state = deriveState((previousState) => {
    if (transactionId) {
      previousState.swapTxHash = transactionId;
    }
    if (swapIndexed) {
      previousState.swapIndexed = true;
    }
  });
  console.log("state", state);

  if (state.swapTxHash && !state.swapIndexed) {
    if (state.chain === "arb") {
      // Query Arbitrum RPC to check if the transaction is confirmed
      const txData = await fetch(`https://arb1.arbitrum.io/rpc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionReceipt",
          params: [state.swapTxHash],
          id: 1,
        }),
      });
      const txResult = await txData.json();
      if (txResult.result && txResult.result.status === "0x1") {
        swapIndexed = true;
        const state = deriveState((previousState) => {
          if (swapIndexed) {
            previousState.swapIndexed = true;
          }
        });
        console.log("state after querying tx hash from Arbitrum RPC", {
          state,
        });
      }
    } else {
      const txData = await fetch(
        `https://api.onceupon.gg/v2/transactions/${state.swapTxHash}`
      );
      if (txData.status === 200) {
        swapIndexed = true;
        const state = deriveState((previousState) => {
          if (swapIndexed) {
            previousState.swapIndexed = true;
          }
        });
        console.log("state after querying tx hash from api", { state });
      }
    }
  }

  const getIntents = (state: State) => {
    // NOTE - Approval for usdc has been mined so we can now swap and move onto the swap frame
    if (state.swapIndexed) {
      return [
        <Button.Link
          href={`${chainIdToExplorerUrl(chainIdMap[state.chain])}/tx/${
            state.swapTxHash
          }`}
        >
          View Confirmed Transaction
        </Button.Link>,
        <Button.Reset>Ape something else</Button.Reset>,
      ];
    }
    if (state.swapTxHash) {
      return [
        <Button value="refresh">🔄 Refresh</Button>,
        <Button.Link
          href={`${chainIdToExplorerUrl(chainIdMap[state.chain])}/tx/${
            state.swapTxHash
          }`}
        >
          View Swap Transaction
        </Button.Link>,
      ];
    } else {
      return [
        <Button.Transaction
          target={`/swap/usdc/${state.chain}/${state.token}/${state.fromAmount}/${state.approvalAddress}`}
        >
          Attempt Swap again
        </Button.Transaction>,
      ];
    }
  };

  const getImage = (state: State) => {
    if (state.swapTxHash) {
      if (state.swapIndexed) {
        if (state.chain === "arb") {
          return (
            <div
              style={{
                alignItems: "center",
                background: "white",
                backgroundSize: "100% 100%",
                display: "flex",
                flexDirection: "column",
                flexWrap: "nowrap",
                height: "100%",
                justifyContent: "center",
                textAlign: "center",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: "black",
                  fontSize: 60,
                  fontStyle: "normal",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.4,
                  marginTop: 30,
                  padding: "0 120px",
                  whiteSpace: "pre-wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: 60, color: "rgb(67, 44, 141)" }}>
                    Trade Executed!
                  </div>
                  <div
                    style={{
                      fontSize: 40,
                      display: "flex",
                      flexDirection: "column",
                      color: "grey",
                    }}
                  >
                    <div>Click below to view on the explorer.</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return <img src={`https://og.onceupon.gg/card/${state.swapTxHash}`} />;
      } else {
        return (
          <div
            style={{
              alignItems: "center",
              background: "white",
              backgroundSize: "100% 100%",
              display: "flex",
              flexDirection: "column",
              flexWrap: "nowrap",
              height: "100%",
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "black",
                fontSize: 60,
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                marginTop: 30,
                padding: "0 120px",
                whiteSpace: "pre-wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: 60, color: "rgb(67, 44, 141)" }}>
                  Broadcasting...
                </div>
                <div
                  style={{
                    fontSize: 40,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div>Click "Refresh" below to check on your transaction.</div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    return <div style={{ fontSize: 60 }}>Swapping with USDC...</div>;
  };

  return c.res({
    browserLocation: `${chainIdToExplorerUrl(chainIdMap[state.chain])}/tx/${
      state.swapTxHash
    }`,
    image: getImage(state),
    intents: getIntents(state),
  });
};

//
export const FindUSDCSwapFrame = async (
  app: Frog<Env & { State: State }, {}, "/find-swap/usdc">
) => {
  app.frame("/find-swap/usdc", findUSDCSwapHandler);
};
