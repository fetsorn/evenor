import React from "react";

interface IQueryListLabelProps {
  field: any;
  value: any;
}

export default function QueryListLabel({ field, value }: IQueryListLabelProps) {
  return (
    <div>
      {field} {value}
    </div>
  );
}
