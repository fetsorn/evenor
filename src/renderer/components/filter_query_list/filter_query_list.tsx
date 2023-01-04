import { useEffect, useState, useMemo } from "react";

export default function QueryList() {
  return (
    <div className={styles.query}>
      {Object.keys(params).map((prop: any, idx: any) => (
        <div key={idx} className={styles.queries}>
          <QueryListLabel prop={prop} value={params[prop]} />
          <QueryListRemoveButton prop={prop} onRemove={removeQuery} />
        </div>
      ))}
    </div>
  );
}
