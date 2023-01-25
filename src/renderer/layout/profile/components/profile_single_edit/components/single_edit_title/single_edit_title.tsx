import React from "react";
import styles from "./single_edit_title.module.css";
import { Title } from "../../../../../../components";

// TODO: replace with Day.js
function isDate(title: string): boolean {
  return true;
}

// TODO: replace with Day.js
function formatDate(title: string): string {
  return title;
}

interface ISingleEditTitleProps {
  group: any;
  index: any;
}

export default function SingleEditTitle({
  group,
  index,
}: ISingleEditTitleProps) {
  return (
    <Title>
      {isDate(group) ? formatDate(group) : group} {index}
    </Title>
  );
}
