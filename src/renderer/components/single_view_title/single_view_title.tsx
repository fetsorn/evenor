import React from "react";
import styles from "./single_view_title.module.css";
import { Title } from "..";

// TODO: replace with Day.js
function isDate(title: string): boolean {
  return true;
}

// TODO: replace with Day.js
function formatDate(title: string): string {
  return title;
}

interface ISingleViewTitleProps {
  group: any;
  index: any;
}

export default function SingleViewTitle({
  group,
  index,
}: ISingleViewTitleProps) {
  return (
    <Title>
      {isDate(group) ? formatDate(group) : group} {index}
    </Title>
  );
}
