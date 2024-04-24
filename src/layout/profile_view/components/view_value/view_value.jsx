import React from "react";

export function ViewValue({ schema, index, description, base, value }) {
  return (
    <div>
      <label>{description}:</label>
      <div>{value}</div>
    </div>
  );
}
