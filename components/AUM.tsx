/** @jsxImportSource frog/jsx */
import { TokenAttributes } from "@/actions/fetch-token-info";
import {
  FollowerLeaderboardWithAUM as FollowerLeaderboardType,
  TopUserByAUM,
} from "../schema";

const AUM = ({
  data,
  page,
  tokenInfo,
}: {
  data: TopUserByAUM[];
  page: number;
  tokenInfo: TokenAttributes[];
}) => {
  const columnWidths = ["30%", "20%", "20%", "20%"];

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
          width: "100%",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            fontSize: "18px",
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
            AUM
          </div>
          <div
            style={{
              fontWeight: "bold",
              color: "#E2E8F0",
              width: columnWidths[2],
            }}
          >
            {`Largest  💰`}
          </div>
        </div>
      </div>
      {data.slice(page * 10, (page + 1) * 10).map((user, index) => (
        <div
          key={user.username}
          style={{
            display: "flex",
            alignItems: "flex-start", // Ensure vertical alignment
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
              src={user.avatarUrl}
              alt={user.username}
            />
            <span
              style={{
                fontWeight: "bold",
                color: "#FFFFFF",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.username}
            </span>
          </div>

          <span
            style={{
              display: "flex",
              marginTop: "8px",
              color: "#CBD5E0",
              width: columnWidths[1],
            }}
          >
            {`${user.trueFollowerCount.toLocaleString()}`}
          </span>

          <span
            style={{
              display: "flex",
              marginTop: "8px",
              color: "#68D391",
              width: columnWidths[3],
            }}
          >
            {`$${user.aum.toLocaleString()}`}
          </span>

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
              style={{
                display: "flex",
                marginLeft: "4px",
                width: "35px",
                height: "35px",
              }}
              src={
                tokenInfo.find(
                  (t) =>
                    t.address.toLowerCase() === user.tokenAddress.toLowerCase()
                )?.image_url ?? ""
              }
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
              {user.tokenName}
            </span>
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          bottom: "15px",
          right: "20px",
          fontSize: "24px",
          color: "#0052FF", // BASE blue color
        }}
      >
        @tybb
      </div>
    </div>
  );
};

export { AUM };
