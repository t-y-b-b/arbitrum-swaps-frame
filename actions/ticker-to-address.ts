import {
  LIFI_API_URL,
  TOKENLIST_CACHE_FILENAME,
  TOKENLIST_CACHE_KEY,
  TOKENLIST_CACHE_TTL,
} from "../lib/constants";

// NOTE - Manual filtered list from https://li.quest/v1/chains
// NOTE - Except Solana is actually manually added
// (As the tokens list endpoint actually supports it)
// https://li.quest/v1/tokens
export enum ChainId {
  eth = 1,
  ethereum = 1,
  bsc = 56,
  arb = 42161,
  arbitrum = 42161,
  avax = 43114,
  matic = 137,
  op = 10,
  optimism = 10,
  base = 8453,
  sol = 1151111081099710,
}

export const chainIdMap: Record<string, ChainId> = {
  eth: ChainId.eth,
  bsc: ChainId.bsc,
  arb: ChainId.arb,
  arbitrum: ChainId.arb,
  avax: ChainId.avax,
  matic: ChainId.matic,
  op: ChainId.op,
  base: ChainId.base,
  sol: ChainId.sol,
};

export const chainIdToName: Record<ChainId, string> = {
  [ChainId.eth]: "eth",
  [ChainId.bsc]: "bsc",
  [ChainId.arb]: "arb",
  [ChainId.avax]: "avax",
  [ChainId.matic]: "matic",
  [ChainId.op]: "op",
  [ChainId.base]: "base",
  [ChainId.sol]: "sol",
};
export const chainIdToCoingeckoId: Record<ChainId, string> = {
  [ChainId.eth]: "eth",
  [ChainId.bsc]: "bsc",
  [ChainId.arb]: "arbitrum",
  [ChainId.avax]: "avax",
  [ChainId.matic]: "polygon",
  [ChainId.op]: "optimism",
  [ChainId.base]: "base",
  [ChainId.sol]: "solana",
};
export interface Token {
  address: string;
  decimals: number;
  symbol: string;
  chainId: number;
  coinKey?: string;
  name: string;
  logoURI: string;
  priceUSD: string;
}

export type TokenList = {
  [chain in ChainId]?: Token[];
};
interface TokenListResponse {
  tokens: TokenList;
}

async function fetchLifiTokenList(
  chains?: ChainId[],
  chainType?: string[]
): Promise<TokenList> {
  const queryParams = new URLSearchParams();
  if (chains) queryParams.append("chains", chains.join(","));
  if (chainType) queryParams.append("chainTypes", chainType.join(","));

  const fetchWithRetry = async (
    url: string,
    retries: number = 5,
    delayMs: number = 1000
  ): Promise<Response> => {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response; // Success
      } catch (error: any) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw lastError; // Throw the last error encountered
  };

  const response = await fetchWithRetry(
    `${LIFI_API_URL}/tokens?${queryParams}`
  );
  const jsonResponse: TokenListResponse = await response.json();
  return jsonResponse.tokens;
}

export async function getTokenList(chain: ChainId): Promise<TokenList> {
  try {
    let result: TokenList = await fetchLifiTokenList([chain]);
    // onsole.info("Fetched tokens list from Lifi API.");
    return result;
  } catch (error) {
    console.error("An error occurred:", error);
    return {};
  }
}

function findChainAddresses(
  tokensList: TokenList,
  ticker: string
): [ChainId, Token[]] | undefined {
  return Object.entries(tokensList).find(([_, coinData]) =>
    coinData.some((coin) => coin.symbol.toLowerCase() === ticker.toLowerCase())
  ) as [ChainId, Token[]] | undefined;
}

function findCoinData(
  chainId: ChainId | undefined,
  tokensList: TokenList,
  ticker: string
): Token | undefined {
  return chainId
    ? tokensList[chainId]?.find(
        (coin) => coin.symbol.toLowerCase() === ticker.toLowerCase()
      )
    : undefined;
}

export const getFirstMatchedTokenForTicker = async (
  chainId: ChainId,
  ticker: string
) => {
  const tokensList = await getTokenList(chainId);
  const chainAddresses = findChainAddresses(tokensList, ticker);
  if (!chainAddresses) {
    throw new Error(`No token found for ticker: ${ticker}`);
  }
  // console.log(chainAddresses);
  const [chainIdForTicker] = chainAddresses;
  const token = findCoinData(chainId, tokensList, ticker);
  if (!token) {
    throw new Error(`No token found for ticker: ${ticker}`);
  }
  return { address: token.address, chainId: chainIdToCoingeckoId[chainId] };
};
