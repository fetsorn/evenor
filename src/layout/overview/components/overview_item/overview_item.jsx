import React from "react";
import cn from "classnames";
import styles from "./overview_item.module.css";

export function OverviewItem({
  record,
  onRecordSelect,
  isLast,
  ...others
}) {
  return (
    <button
      className={cn(styles.row, { [styles.last]: isLast })}
      onClick={() => onRecordSelect(record)}
      {...others}
    >
      {Object.keys(record).map((key) => {
        const value = record[key];

        const isString = typeof value === "string";

        const label = `${key}: ${value}`;

        const labelShort = label.slice(0, 40);

        const item = isString ? <div key={key}>{labelShort}</div> : undefined;

        return item
      })}
    </button>
  )
}
