import React from "react";
const Banner = ({ message, className = "" }) => {
  const isSuccess = className.includes("success");
  return (
    <div className={`ink-banner ${isSuccess ? "ink-banner-success" : "ink-banner-danger"}`}>
      {message}
    </div>
  );
};
export default Banner;
