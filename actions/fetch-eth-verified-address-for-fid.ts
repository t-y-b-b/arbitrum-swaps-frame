import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export const neynarSDK = new NeynarAPIClient(
  process.env.NEYNAR_API_KEY ?? "NEYNAR_API_DOCS"
);

export const getFirstVerifiedETHAddressByFid = async (
  fid: number
): Promise<string | undefined> => {
  try {
    const result = await neynarSDK.fetchBulkUsers([fid], { viewerFid: 3 });

    return result.users[0].verified_addresses["eth_addresses"][0];
  } catch (error) {
    throw new Error(
      `Error getting verified ETH address for fid ${fid}: ${error}`
    );
  }
};
