import React from "react";
import { Paragraph } from "..";

interface IFormOutputProps {
  description: any;
  value: any;
  index: any;
}

export default function FormOutput({
  description,
  value,
  index,
}: IFormOutputProps) {
  return (
    <div key={index}>
      <div>{description}</div>

      <Paragraph>{value}</Paragraph>
    </div>
  );
}
