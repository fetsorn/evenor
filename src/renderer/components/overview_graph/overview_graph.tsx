import { useEffect, useState } from "react";
import { Graph, InputDepth, InputFamily } from "..";
import { setupVars, load } from "./Tree";
import styles from "./Tree.module.css";

export default function Tree() {
  const [depth, setDepth] = useState(4);

  const [familyID, setFamilyID] = useState("F0001");

  const [html, setHTML] = useState(undefined);

  useEffect(() => {
    setupVars();
  }, []);

  useEffect(() => {
    (async () => {
      const newHTML = await load(depth, familyID);

      setHTML(newHTML);
    })();
  }, [depth, familyID]);

  return (
    <>
      <Graph html={html} />

      <div className={styles.slider}>
        <InputFamily familyID={familyID} setFamilyID={setFamilyID} />

        <InputDepth depth={depth} setDepth={setDepth} />
      </div>
    </>
  );
}
