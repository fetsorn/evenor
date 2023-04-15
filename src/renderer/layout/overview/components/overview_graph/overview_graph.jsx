import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/index.js';
import { load } from './overview_graph_controller.js';
import { GraphSvg, GraphTextInput, GraphRangeInput } from './components/index.js';
import styles from './overview_graph.module.css';

export function OverviewGraph() {
  const navigate = useNavigate();

  const [depth, setDepth] = useState(4);

  const [family, setFamily] = useState(undefined);

  const [html, setHTML] = useState(undefined);

  const [
    repoUUID,
    onQueryAdd,
    onChangeOverviewType,
  ] = useStore((state) => [
    state.repoUUID,
    state.onQueryAdd,
    state.onChangeOverviewType,
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
    window.ged2dot_setFamilyID = (id) => {
      setFamily(id);
    };

    window.ged2dot_setPersonREFN = async (refn) => {
      await onQueryAdd('actname', refn);

      onChangeOverviewType('itinerary');
    };

    window.ged2dot_setPersonUUID = async (uuid) => {
      await onQueryAdd('actname', uuid);

      onChangeOverviewType('itinerary');
    };
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
