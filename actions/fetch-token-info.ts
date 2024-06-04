import NodeCache from "node-cache";
import { TokenBalance } from "../schema";
import { COINGECKO_API_URL } from "@/lib/constants";

export interface TokenAttributes {
  address: string;
  name: string;
  symbol: string;
  image_url: string;
  coingecko_coin_id: string;
  decimals: number;
  total_supply: string;
  price_usd: string;
  fdv_usd: string;
  total_reserve_in_usd: string;
  volume_usd: Record<string, unknown>;
  market_cap_usd: number | null;
}

interface TokenInfo {
  id: string;
  type: string;
  attributes: TokenAttributes;
  relationships: {
    top_pools: Record<string, unknown>;
  };
}

export interface TokenInfoResponse {
  data: TokenInfo[];
}

const CACHE_KEY = "tokenInfo";
const CACHE_TTL = 1800; // 30 minutes
const cache = new NodeCache({ stdTTL: CACHE_TTL }); // Cache TTL of 30 minutes

export const fetchTokenInfo = async (
  tokens: string[],
  chain: string = "base"
): Promise<TokenAttributes[]> => {
  const tokenAddresses = tokens
    .map((token) =>
      token.replace(
        /0x0000000000000000000000000000000000000000/g,
        "0x4200000000000000000000000000000000000006"
      )
    )
    .join(",");

  const cachedData: TokenAttributes[] | undefined = cache.get(CACHE_KEY);
  if (cachedData) {
    return cachedData;
  }

  const headers: HeadersInit = {
    accept: "application/json",
  };

  headers["x-cg-pro-api-key"] = process.env.API_KEY_COINGECKO ?? "";

  const response = await fetch(
    `${COINGECKO_API_URL}/${chain}/tokens/multi/${tokenAddresses}`,
    {
      headers,
    }
  );
  const res: TokenInfoResponse = await response.json();
  const newTokenData = res.data.map((token) => token.attributes);

  const mergedData: TokenAttributes[] = cachedData
    ? Array.from(
        new Map(
          [...cachedData, ...newTokenData].map((item) => [item.address, item])
        ).values()
      )
    : newTokenData;

  cache.set(CACHE_KEY, mergedData);
  return newTokenData;
};
