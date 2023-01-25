import React from "react";

interface IQueryListLabelProps {
  prop: any;
  value: any;
}

export default function QueryListLabel({ prop, value }: IQueryListLabelProps) {
  return (
    <div>
      {prop} {value}
    </div>
  );
}
