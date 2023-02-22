import React from "react";
import { Paragraph } from "@/components";

export function FieldText({ value }) {
  return (
    <div>
      <Paragraph>{value}</Paragraph>
    </div>
  );
}
