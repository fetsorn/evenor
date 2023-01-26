import React from "react";
import styles from "./single_edit_title.module.css";
import { Title } from "../../../../../../components";
import { useStore } from "../../../../../../store";

// TODO: replace with Day.js
function isDate(title: string): boolean {
  return true;
}

// TODO: replace with Day.js
function formatDate(title: string): string {
  return title;
}

export default function SingleEditTitle() {
  const group = useStore((state) => state.group)

  const index = useStore((state) => state.index)

  return (
    <Title>
      {isDate(group) ? formatDate(group) : group} {index}
    </Title>
  );
}
