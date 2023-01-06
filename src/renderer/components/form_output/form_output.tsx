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
    <>
      {value ? (
        <div>
          <div key={`output_${index}`}>{description}</div>

          <Paragraph key={`label_${index}`}>{value}</Paragraph>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
