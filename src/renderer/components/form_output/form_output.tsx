import React from "react";
import { Paragraph } from "..";

interface IFormOutputProps {
  description: any;
  value: any;
}

export default function FormOutput({ description, value }: IFormOutputProps) {
  return (
    <div>
      <div>{description}</div>

      <Paragraph>{value}</Paragraph>
    </div>
  );
}
