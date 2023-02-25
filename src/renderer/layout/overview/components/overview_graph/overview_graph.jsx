import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/index.js';
import { setupVars, load } from './overview_graph_controller.js';
import { GraphSvg, GraphTextInput, GraphRangeInput } from './components/index.js';
import styles from './overview_graph.module.css';

export function OverviewGraph() {
  const navigate = useNavigate();

  const [depth, setDepth] = useState(4);

  const [family, setFamily] = useState(undefined);

  const [html, setHTML] = useState(undefined);

  const [
    repoUUID,
  ] = useStore((state) => [
    state.repoUUID,
  ]);

  async function onSetDepth(_depth) {
    setDepth(_depth);

    await load(repoUUID, _depth, family);
  }

  async function onSetFamily(_family) {
    setFamily(_family);

    await load(repoUUID, depth, _family);
  }

  useEffect(() => {
    setupVars(navigate, setFamily);
  }, []);

  useEffect(() => {
    (async () => {
      const newHTML = await load(repoUUID, depth, family);

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
