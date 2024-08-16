import React from "react";

export function ViewValue({ schema, index, description, base, value }) {
  return (
    <span>
      <label>{description}:</label>
      <span>{value}</span>
    </span>
  );
}
