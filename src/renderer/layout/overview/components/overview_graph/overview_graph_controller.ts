import { Graphviz } from "@hpcc-js/wasm";
import { ged2dot, ged2dot_ } from "@fetsorn/ged2dot";
import { fetchDataMetadir } from "@/api";

declare global {
  interface Window {
    ged2dot_setFamilyID?: any;
    ged2dot_setPersonREFN?: any;
    ged2dot_setPersonUUID?: any;
  }
}

export function setupVars(navigate: any, setFamily: any): void {
  window.ged2dot_setFamilyID = (id: string) => {
    setFamily(id);
  };

  window.ged2dot_setPersonREFN = (refn: string) => {
    navigate(`?hostname=${refn}&overviewType=itinerary`);
  };

  window.ged2dot_setPersonUUID = (uuid: string) => {
    navigate(`?hostname=${uuid}&overviewType=itinerary`);
  };
}

export async function load(
  dir: string,
  depth: any,
  familyID: any
): Promise<string> {
  try {
    const html = await render(dir, depth, familyID);

    return html;
  } catch (e3) {
    console.log(e3);
  }
}

async function render(dir: string, depth: any, familyID: any): Promise<string> {
  // if there's a gedcom file, render tree
  try {
    const html = await renderGed(dir, depth, familyID);

    console.log("set index.ged");

    return html;
  } catch (e1) {
    console.log("no index.ged", e1);
  }

  // if there's an index file, render it as overview
  try {
    const html = await renderIndex(dir);

    console.log("set index.html");

    return html;
  } catch (e2) {
    console.log("no index.html", e2);
  }

  throw "render failed for unknown reason";
}

async function renderGed(
  dir: string,
  depth: any,
  familyID: any
): Promise<string> {
  const index = await fetchDataMetadir(dir, "index.ged");

  // TODO: ged2dot needs to be able to figure out familyID
  // when passed familyID is undefined or non-existing
  let dot;

  if (familyID) {
    dot = ged2dot(index, depth, familyID);
  } else {
    dot = ged2dot_(index);
  }

  const graphviz = await Graphviz.load();

  // render dot notation with graphviz
  const svg = graphviz.layout(dot, "svg", "dot");

  return svg;
}

async function renderIndex(dir: string): Promise<string> {
  const index = await fetchDataMetadir(dir, "index.html");

  return index;
}
