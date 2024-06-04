/** @jsxImportSource frog/jsx */
import { FollowerLeaderboard as FollowerLeaderboardType } from "../schema";

const FollowerLeaderboard = ({
  data,
  page,
}: {
  data: FollowerLeaderboardType[];
  page: number;
}) => {
  const columnWidths = ["35%", "15%", "10%", "10%", "10%"];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        height: "100%",
        width: "100%",
        backgroundColor: "#1A202C",
        color: "#CBD5E0",
        padding: "20px 25px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              color: "#E2E8F0",
              width: columnWidths[0],
            }}
          >
            Display Name
          </div>
          <div
            style={{
              fontWeight: "bold",
              color: "#E2E8F0",
              width: columnWidths[1],
            }}
          >
            Follower Count
          </div>
          <div
            style={{
              fontWeight: "bold",
              color: "#E2E8F0",
              width: columnWidths[3],
            }}
          >
            24hr % Change
          </div>
          <div
            style={{
              fontWeight: "bold",
              color: "#E2E8F0",
              width: columnWidths[2],
            }}
          >
            7d % Change
          </div>
          <div
            style={{
              fontWeight: "bold",
              color: "#E2E8F0",
              width: columnWidths[4],
            }}
          >
            30d % Change
          </div>
        </div>
      </div>
      {data.slice(page * 10, (page + 1) * 10).map((follower, index) => (
        <div
          key={follower.username}
          style={{
            display: "flex",
            alignItems: "flex-start", // Ensure vertical alignment
            justifyContent: "space-between",
            width: "100%",
            padding: "3px 0px", // Uniform padding for all rows
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "15px",
              width: columnWidths[0],
            }}
          >
            <img
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              src={follower.avatarUrl}
              alt={follower.displayName}
            />
            <span
              style={{
                fontWeight: "bold",
                color: "#E2E8F0",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {follower.displayName}
            </span>
          </div>

          <span
            style={{
              display: "flex",
              color: "#A0AEC0",
              width: columnWidths[1],
            }}
          >
            {follower.trueFollowerCount.toLocaleString()}
          </span>

          <span
            style={{
              display: "flex",
              color: follower.hr24Pct >= 0 ? "#68D391" : "#FC8181",
              width: columnWidths[3],
            }}
          >
            {follower.hr24Pct.toFixed(2)}%
          </span>

          <span
            style={{
              display: "flex",
              color: follower.d7Pct >= 0 ? "#68D391" : "#FC8181",
              width: columnWidths[2],
            }}
          >
            {follower.d7Pct.toFixed(0)}%
          </span>

          <span
            style={{
              display: "flex",
              color: follower.d30Pct >= 0 ? "#68D391" : "#FC8181",
              width: columnWidths[4],
            }}
          >
            {follower.d30Pct.toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
};

export { FollowerLeaderboard };
