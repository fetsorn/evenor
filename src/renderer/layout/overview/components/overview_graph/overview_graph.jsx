import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { setupVars, load } from "./overview_graph_controller.js";
import { GraphSvg, GraphTextInput, GraphRangeInput } from "./components";
import styles from "./overview_graph.module.css";

export default function OverviewGraph() {
  const navigate = useNavigate();

  const [depth, setDepth] = useState(4);

  const [family, setFamily] = useState(undefined);

  const [html, setHTML] = useState(undefined);

  const [
    repoRoute
  ] = useStore((state) => [
    state.repoRoute
  ]);

  async function onSetDepth(_depth) {
    setDepth(_depth);

    await load(repoRoute, _depth, family);
  }

  async function onSetFamily(_family) {
    setFamily(_family);

    await load(repoRoute, depth, _family);
  }

  useEffect(() => {
    setupVars(navigate, setFamily);
  }, []);

  useEffect(() => {
    (async () => {
      const newHTML = await load(repoRoute, depth, family);

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
