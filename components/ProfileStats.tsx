/** @jsxImportSource frog/jsx */
import { FollowerLeaderboard as FollowerLeaderboardType } from "../schema";

const ProfileStats = ({ data }: { data: FollowerLeaderboardType }) => {
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
          marginBottom: "20px", // Doubled size
          gap: "30px", // Doubled size
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "30px", // Doubled size
          }}
        >
          <img
            style={{
              objectFit: "cover",
              borderRadius: "50%",
              width: "150px", // Doubled size
              height: "150px", // Doubled size
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
              fontSize: "48px", // Doubled size
            }}
          >
            {data.displayName}
          </span>
        </div>
        <div style={{ display: "flex", paddingLeft: "20px" }}>
          <span
            style={{
              display: "flex",
              fontWeight: "bold",
              fontSize: "36px", // Doubled size
              marginRight: "15px", // Doubled size
            }}
          >
            {`${data.trueFollowerCount.toLocaleString()}`}
          </span>
          <span style={{ fontSize: "36px", color: "#A0AEC0" }}>
            {" "}
            Follower Count
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "300px",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "34px",
              color: "#38A169",
              fontWeight: "bold",

              width: "45%",
            }}
          >
            {`+${data.hr24Pct.toFixed(0)}%`}
          </span>
          <span style={{ fontSize: "24px" }}>24hr Change</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "300px",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "34px",
              color: "#38A169",
              fontWeight: "bold",
              width: "45%",
            }}
          >
            {`+${data.d7Pct.toFixed(0)}%`}
          </span>
          <span style={{ fontSize: "24px" }}>7d Change</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "300px",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "34px",
              color: "#38A169",
              fontWeight: "bold",
              width: "45%",
            }}
          >
            {`+${data.d30Pct.toFixed(0)}%`}
          </span>
          <span style={{ fontSize: "24px" }}>30d Change</span>
        </div>
      </div>
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
  );
};

export { ProfileStats };
