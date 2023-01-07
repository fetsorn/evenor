import { useEffect, useState } from "react";
import { GraphSvg, GraphTextInput, GraphRangeInput } from "..";
import { setupVars, load } from "./tbn";
import styles from "./overview_graph.module.css";

export default function Tree() {
  const [depth, setDepth] = useState(4);

  const [family, setFamily] = useState("F0001");

  const [html, setHTML] = useState(undefined);

  async function onSetDepth(_depth: any) {
    setDepth(_depth);

    await load(_depth, family);
  }

  async function onSetFamily(_family: any) {
    setFamily(_family);

    await load(depth, _family);
  }

  useEffect(() => {
    setupVars(setFamily);
  }, []);

  useEffect(() => {
    (async () => {
      const newHTML = await load(depth, family);

      setHTML(newHTML);
    })();
  }, [depth, family]);

  return (
    <>
      <GraphSvg html={html} />

      <div className={styles.slider}>
        <GraphTextInput {...{ family, onSetFamily }} />

        <GraphRangeInput {...{ depth, onSetDepth }} />
      </div>
    </>
  );
}
