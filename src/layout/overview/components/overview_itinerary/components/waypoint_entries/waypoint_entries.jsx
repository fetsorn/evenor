import React from "react";
import { useStore } from "../../../../../../store/index.js";
import { colorFile } from "./waypoint_entries_controller.js";
import styles from "./waypoint_entries.module.css";

function findBranchItem(obj, itemKey) {
  const toString = Object.prototype.toString;
  const hasOwn = Object.prototype.hasOwnProperty.bind(obj);

  for (const key in obj) {
    if (hasOwn(key)) {
      if (obj._ === itemKey) {
        return obj;
      }
      if (
        toString.call(obj[key]) === "[object Array]" ||
        toString.call(obj[key]) === "[object Object]"
      ) {
        return findBranchItem(obj[key], itemKey);
      }
    }
  }

  return undefined;
}

export function WaypointEntries({ entries, onRecordSelect }) {
  const [schema] = useStore((state) => [state.schema]);

  const fileBranch =
    Object.keys(schema).find((b) => schema[b].task === "file") ??
    Object.keys(schema).find((b) => schema[b].task === "filename");

  const filenameBranch = Object.keys(schema).find(
    // when file is object, filename is a leaf
    // when file is a string, it is also a filename
    (b) =>
      (schema[b].trunk === fileBranch || b === fileBranch) &&
      schema[b].task === "filename",
  );

  const filetypeBranch = Object.keys(schema).find(
    (b) =>
      (schema[b].trunk === fileBranch || b === fileBranch) &&
      schema[b].task === "filetype",
  );

  function colorRecord(record) {
    if (filenameBranch || filetypeBranch) {
      const file = findBranchItem(record, fileBranch);

      if (file) {
        return colorFile(file[filenameBranch], file[filetypeBranch]);
      }
    }

    return "black";
  }

  return (
    <div className={styles.content}>
      <div className={styles.stars}>
        {entries.map((record, index) => (
          <div key={`waypoint_record_${Math.random()}`}>
            <button
              className={styles.star}
              style={{
                backgroundColor: colorRecord(record),
              }}
              type="button"
              onClick={() => onRecordSelect(record, index + 1)}
              title={record?.FILE_PATH}
              id={record?.UUID}
            >
              {index + 1}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
