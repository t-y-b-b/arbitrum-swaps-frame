/** @jsxImportSource frog/jsx */
import React from "react";

interface StyledImageProps {
  message: string;
}

const StyledTextImage: React.FC<StyledImageProps> = ({ message }) => {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#8565CB",
        fontSize: 50,
        fontWeight: 600,
        color: "white",
        padding: 20,
      }}
    >
      {message}
    </div>
  );
};

export default StyledTextImage;
