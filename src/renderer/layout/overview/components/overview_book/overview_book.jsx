import React, { useEffect, useState } from 'react';
import { exportPDF, generateLatex } from 'lib/latex/';
import { useStore } from '@/store/index.js';

export function OverviewBook() {
  const [blobURL, setBlobURL] = useState([]);

  const [
    records,
    sortBy,
  ] = useStore((state) => [
    state.records,
    state.sortBy,
  ]);

  async function onUseEffect() {
    // create latex from records
    const latex = generateLatex(records);

    const url = await exportPDF(latex);

    setBlobURL(url);
  }

  useEffect(() => {
    onUseEffect();
  }, [records, sortBy]);

  return (
    <iframe title="iframe" src={blobURL} width="50%" height="800px" />
  );
}
