import { graphviz } from "@hpcc-js/wasm";
import { fetchDataMetadir, gitInit, exportPDF, emptyLaTeX } from "../../utils";
import { ged2dot, ged2dot_ } from "@fetsorn/ged2dot";

async function dot2svg(dot: any) {
  // render dot notation with graphviz
  const svg = await graphviz.layout(dot, "svg", "dot");

  return svg;
}

  const render = async (_familyID: any = familyID, _depth: any = depth) => {
    const dot = ged2dot(data, _familyID, _depth);
    const svg = await dot2svg(dot);
    setHtml(svg);
  };

  const exportTree = async () => {
    const pdfURL = await exportPDF(emptyLaTeX);
    /* const link = document.createElement("a"); */
    if (__BUILD_MODE__ === "electron") {
      await window.electron.openPDF(pdfURL);
      /* await window.electron.writeDataMetadir(window.dir, "aaa", "aaa"); */
    } else {
      const w = window.open(pdfURL, "_blank");
      w && w.focus();
    }
  };

  const reloadPage = async () => {
    setIsLoading(true);

    gitInit(location.pathname);

    // if there's a gedcom file, render tree
    try {
      const index = await fetchDataMetadir("index.ged");
      setData(index);
      const dot = ged2dot_(index);
      const svg = await dot2svg(dot);
      setHtml(svg);
      setIsTree(true);
      setIsLoading(false);
      console.log("set index.ged");
      return;
    } catch (e1) {
      console.log("no index.ged", e1);
    }

    // if there's an index file, render it as overview
    try {
      const index = await fetchDataMetadir("index.html");
      setHtml(index);
      setIsLoading(false);
      console.log("set index.html");
      return;
    } catch (e2) {
      console.log("no index.html", e2);
    }

    // redirect to empty query to open Line
    try {
      console.log("redirect to query");
      navigate(`q`, { replace: true });
      setIsLoading(false);
      return;
    } catch (e3) {
      console.log(e3);
    }
  };
  function inUseEffect() {
    window.ged2dot_setFamilyID = (id: string) => {
      setFamilyID(id);
    };
    window.ged2dot_setPersonREFN = (refn: string) => {
      navigate(`q?hostname=${refn}`);
    };
    window.ged2dot_setPersonUUID = (uuid: string) => {
      navigate(`q?hostname=${uuid}`);
    };
  }