import { db } from "@/lib/drizzle";
import { sql } from "drizzle-orm";
import { TopUserByAUM } from "../schema";

const rankedBalances = sql`
  SELECT
    fid,
    verified_address,
    token_name,
    token_address,
    token_balance_usd,
    ROW_NUMBER() OVER (
      PARTITION BY
        verified_address,
        token_name,
        token_address
      ORDER BY
        created_at DESC
    ) AS rn
  FROM
    token_balances
`;

const aumQuery = sql`
  SELECT
    rb.fid,
    rb.token_name,
    rb.token_address,
    rb.token_balance_usd,
    SUM(rb.token_balance_usd) OVER (PARTITION BY rb.fid) AS aum,
    ROW_NUMBER() OVER (
      PARTITION BY rb.fid
      ORDER BY rb.token_balance_usd DESC
    ) AS rank
  FROM
    (${rankedBalances}) rb
  WHERE
    rb.rn = 1
`;

const topUserTokens = sql`
  SELECT
    aum.fid,
    aum.aum,
    aum.token_name,
    aum.token_address
  FROM
    (${aumQuery}) aum
  WHERE
    aum.rank = 1
  ORDER BY
    aum.aum DESC
  LIMIT 10
`;

const finalQuery = sql`
  SELECT
    fl.fid,
    fl.avatar_url,
    fl.username,
    fl.true_follower_count,
    top_tokens.aum,
    top_tokens.token_name,
    top_tokens.token_address
  FROM
    follower_leaderboard fl
  INNER JOIN
    (${topUserTokens}) top_tokens
  ON
    fl.fid = top_tokens.fid
  ORDER BY
    top_tokens.aum DESC
`;

export const fetchTopUsersByAUM = async (): Promise<TopUserByAUM[]> => {
    const data = await db.execute(finalQuery);
    const result = data.map((row) => ({
      fid: row.fid as string,
      avatarUrl: row.avatar_url as string,
      username: row.username as string,
      trueFollowerCount: row.true_follower_count as number,
      aum: row.aum as number,
      tokenName: row.token_name as string,
      tokenAddress: row.token_address as string,
    }));
    return result;
  };
