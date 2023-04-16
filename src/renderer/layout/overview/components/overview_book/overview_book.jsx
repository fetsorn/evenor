import React, { useEffect, useState } from 'react';
import { API } from 'lib/api';
import { useStore } from '@/store/index.js';

export function OverviewBook() {
  const [blobURL, setBlobURL] = useState([]);

  const [
    overview,
    groupBy,
  ] = useStore((state) => [
    state.overview,
    state.groupBy,
  ]);

  async function onUseEffect() {
    const pdfblob = await API.pdf(overview);

    const objectURL = URL.createObjectURL(pdfblob);

    console.log(objectURL);

    setTimeout(() => {
      URL.revokeObjectURL(objectURL);
    }, 30000);

    setBlobURL(objectURL);
  }

  useEffect(() => {
    onUseEffect();
  }, [overview, groupBy]);

  return (
    <iframe title="iframe" src={blobURL} width="50%" height="800px" />
  );
}
