import React, { useEffect, useState } from "react";
import { exportPDF, generateLatex } from "lib/latex";
import { useStore } from "@/store";

export default function OverviewBook() {
  const [blobURL, setBlobURL] = useState<any>([]);

  const [
    overview,
    groupBy,
  ]  = useStore((state) => [
    state.overview,
    state.groupBy,
  ])

  async function onUseEffect() {
    // create latex from overview
    const latex = generateLatex(overview);

    const url = await exportPDF(latex);

    setBlobURL(url);
  }

  useEffect(() => {
    onUseEffect();
  }, [overview, groupBy]);

  return (
    <iframe title="iframe" src={blobURL} width="50%" height="800px"></iframe>
  )
}
