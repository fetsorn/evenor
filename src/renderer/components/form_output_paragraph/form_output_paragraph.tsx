import React from "react";
import { Paragraph } from "..";

interface IFormOutputParagraphProps {
  description: any;
  value: any;
}

export default function FormOutputParagraph({
  description,
  value,
}: IFormOutputParagraphProps) {
  return (
    <div>
      <div>{description}</div>

      <Paragraph>{value}</Paragraph>
    </div>
  );
}
