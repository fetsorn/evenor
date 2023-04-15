import React from 'react';
import { useStore } from '@/store/index.js';
import { colorFile } from './waypoint_entries_controller.js';
import styles from './waypoint_entries.module.css';

function findBranchItem(obj, key) {
  let i;
  const ts = Object.prototype.toString;
  const hasOwn = Object.prototype.hasOwnProperty.bind(obj);

  for (i in obj) {
    if (hasOwn(i)) {
      if (obj._ === key) {
        return obj;
      }
      if (ts.call(obj[i]) === '[object Array]' || ts.call(obj[i]) === '[object Object]') {
        return findBranchItem(obj[i], key);
      }
    }
  }

  return undefined;
}

export function WaypointEntries({
  entries,
  onEntrySelect,
}) {
  const [schema] = useStore((state) => [state.schema]);

  const fileBranch = Object.keys(schema).find(
    (b) => schema[b].task === 'file',
  );

  const filenameBranch = Object.keys(schema).find(
    (b) => schema[b].trunk === fileBranch && schema[b].task === 'filename',
  );

  const filetypeBranch = Object.keys(schema).find(
    (b) => schema[b].trunk === fileBranch && schema[b].task === 'filetype',
  );

  function colorEntry(entry) {
    const file = findBranchItem(entry, fileBranch);

    if (file) {
      return colorFile(
        file[filenameBranch],
        file[filetypeBranch],
      );
    }

    return 'black';
  }

  return (
    <div className={styles.content}>
      <div className={styles.stars}>
        {entries.map((entry, index) => (
          <div key={`waypoint_entry_${Math.random()}`}>
            <button
              className={styles.star}
              style={{
                backgroundColor: colorEntry(entry),
              }}
              type="button"
              onClick={() => onEntrySelect(entry, index + 1)}
              title={entry?.FILE_PATH}
              id={entry?.UUID}
            >
              {index + 1}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
