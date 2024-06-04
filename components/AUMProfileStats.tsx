/** @jsxImportSource frog/jsx */
import { FollowerLeaderboard as FollowerLeaderboardType } from "../schema";


interface AUMProfileStatsProps {
  data: {
    rank: number;
    fid: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    trueFollowerCount: number;
    hr24Pct: number;
    d7Pct: number;
    d30Pct: number;
    verifiedAddresses: unknown;
    createdAt: Date;
  };
  aum: number;
  topTokens: { tokenName: string; tokenAddress: string }[];
}

const AUMProfileStats: React.FC<AUMProfileStatsProps> = ({ data, aum, topTokens }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          marginBottom: "20px",
          gap: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <img
            style={{
              objectFit: "cover",
              borderRadius: "50%",
              width: "150px",
              height: "150px",
            }}
            src={data.avatarUrl}
            alt={data.displayName}
          />
          <span
            style={{
              fontWeight: "bold",
              color: "#E2E8F0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "48px",
            }}
          >
            {data.displayName}
          </span>
        </div>
        <div style={{ display: "flex", paddingLeft: "20px" }}>
        <span style={{ fontSize: "36px", color: "#A0AEC0", marginRight: "10px"  }}>
            {" "}
            Balance: 
          </span>
          <span
            style={{
              display: "flex",
              fontWeight: "bold",
              fontSize: "36px",
              marginRight: "15px",
            }}
          >
            {`$${Math.trunc(aum).toLocaleString()}`}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "34px", color: "#E2E8F0", fontWeight: "bold" }}>
            Top 3 Tokens Held on Base
          </span>
        </div>

        {topTokens.slice(0, 3).map((token, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              width: "300px",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                color: "#E2E8F0",
                fontWeight: "normal",
                width: "90%",
                display: "block", // Changed from "inline-block" to "block"
              }}
            >
              {index + 1}.&nbsp;{token.tokenName}
            </span>
            {/* <img
              style={{
                width: "24px",
                height: "24px",
              }}
              src={
                tokenInfo.find(
                  (info) => info.address.toLowerCase() === token.tokenAddress.toLowerCase()
                )?.image_url === "missing.png"
                  ? "https://static.coingecko.com/s/missing_standard-de303d622235a7cd2ddba6e0c5fbcb9be08abc09e609e171ff207cfad9aeae6f.png"
                  : new URL(
                      tokenInfo.find(
                        (info) => info.address.toLowerCase() === token.tokenAddress.toLowerCase()
                      )?.image_url || "", window.location.origin
                    ).href
              }
              alt={token.tokenName}
            /> */}
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            bottom: "15px",
            right: "20px",
            fontSize: "24px",
            color: "#fff",
          }}
        >
          @tybb
        </div>
      </div>
    </div>
  );
};

export { AUMProfileStats };


