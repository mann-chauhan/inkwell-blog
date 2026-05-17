import React from "react";
const SubmitButton = ({ isSubmitting, isDisabled, isSubmitted, name, variant, type = "submit", onClick }) => {
  const isDanger = variant && variant.includes("danger");
  return (
    <button
      type={type}
      onClick={onClick}
      className={isDanger ? "ink-btn-danger" : "ink-btn-ghost"}
      disabled={isSubmitting || isDisabled || isSubmitted}
      style={{ marginLeft: "0.5rem" }}
    >
      {isSubmitting ? "…" : name}
    </button>
  );
};
export default SubmitButton;
