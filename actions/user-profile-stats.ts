import { db } from "@/lib/drizzle";
import { eq, sql } from "drizzle-orm";
import {
  FollowerLeaderboard,
  followerLeaderboard,
  TokenBalance,
} from "../schema";

export const fetchUserProfileAum = async (
  username: string
): Promise<{ 
  totalTokenBalanceUsd: number; 
  topTokens: { tokenName: string; tokenAddress: string }[]; 
  userDetails: FollowerLeaderboard 
} | null> => {
  // Fetch user details
  const userDetails = await db
    .select()
    .from(followerLeaderboard)
    .where(eq(followerLeaderboard.username, username))
    .limit(1)
    .execute();

  if (!userDetails[0]) {
    return null;
  }

  const fid = userDetails[0].fid; // Extract fid

  // Fetch token balances
  const tokenBalancesQuery = sql`
    WITH ranked_balances AS (
      SELECT
        fid,
        verified_address,
        token_name,
        token_address,
        token_balance,
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
    ),
    aggregated_balances AS (
      SELECT
        fid,
        token_name,
        token_address,
        SUM(token_balance) AS total_token_balance,
        SUM(token_balance_usd) AS total_token_balance_usd
      FROM
        ranked_balances
      WHERE
        rn = 1 AND fid = ${fid}
      GROUP BY
        fid,
        token_name,
        token_address
    ),
    ranked_aggregates AS (
      SELECT
        fid,
        token_name,
        token_address,
        total_token_balance,
        total_token_balance_usd,
        ROW_NUMBER() OVER (
          PARTITION BY fid
          ORDER BY total_token_balance_usd DESC
        ) AS rank
      FROM
        aggregated_balances
    )
    SELECT
      fid,
      token_name,
      token_address,
      total_token_balance,
      total_token_balance_usd
    FROM
      ranked_aggregates
    WHERE
      rank <= 5
    ORDER BY
      fid,
      rank;
  `;

  // Fetch AUM
  const aumQuery = sql`
    WITH ranked_balances AS (
      SELECT
        fid,
        verified_address,
        token_name,
        token_address,
        token_balance,
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
    ),
    aggregated_balances AS (
      SELECT
        fid,
        token_name,
        token_address,
        SUM(token_balance) AS total_token_balance,
        SUM(token_balance_usd) AS total_token_balance_usd
      FROM
        ranked_balances
      WHERE
        rn = 1 AND fid = ${fid}
      GROUP BY
        fid,
        token_name,
        token_address
    ),
    ranked_aggregates AS (
      SELECT
        fid,
        token_name,
        token_address,
        total_token_balance,
        total_token_balance_usd,
        ROW_NUMBER() OVER (
          PARTITION BY fid
          ORDER BY total_token_balance_usd DESC
        ) AS rank
      FROM
        aggregated_balances
    )
    SELECT SUM(total_token_balance_usd) AS aum
    FROM ranked_aggregates
    WHERE fid = ${fid};
  `;

  const [userTokenBalance, aumResult] = await Promise.all([
    db.execute(tokenBalancesQuery),
    db.execute(aumQuery),
  ]);

  const topTokens = userTokenBalance.map((balance: any) => ({
    tokenName: balance.token_name,
    tokenAddress: balance.token_address,
  }));

  const totalTokenBalanceUsd = Number(aumResult[0]?.aum ?? 0);

  return {
    totalTokenBalanceUsd,
    topTokens,
    userDetails: userDetails[0],
  };
};
