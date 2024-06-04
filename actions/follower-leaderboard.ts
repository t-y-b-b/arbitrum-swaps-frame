import { db } from "../lib/drizzle";
import { FollowerLeaderboard, followerLeaderboard } from "../schema";
import { desc, gt, eq } from "drizzle-orm";

export const fetchFollowerLeaderboard = async (
  timeframe?: "hr24Pct" | "d7Pct" | "d30Pct"
): Promise<FollowerLeaderboard[]> => {
  const column = timeframe
    ? followerLeaderboard[timeframe]
    : followerLeaderboard.d7Pct;

  const data = await db
    .select()
    .from(followerLeaderboard)
    .orderBy(desc(followerLeaderboard.createdAt), desc(column))
    .where(gt(followerLeaderboard.d30Pct, 0))
    .limit(10);

  return data;
};

export const fetchByUsername = async (
  username: string
): Promise<FollowerLeaderboard> => {
  const data = await db
    .select()
    .from(followerLeaderboard)
    .where(eq(followerLeaderboard.username, username.replaceAll("@", "")))
    .limit(1);

  return data?.[0];
};
