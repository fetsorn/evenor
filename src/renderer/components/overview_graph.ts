import { graphviz } from "@hpcc-js/wasm";
import { useNavigate } from "react-router-dom";
import { ged2dot } from "@fetsorn/ged2dot";
import { fetchDataMetadir } from ".";

declare global {
  interface Window {
    ged2dot_setFamilyID?: any;
    ged2dot_setPersonREFN?: any;
    ged2dot_setPersonUUID?: any;
  }
}

export function setupVars(setFamily: any): void {
  const navigate = useNavigate();

  window.ged2dot_setFamilyID = (id: string) => {
    setFamily(id);
  };

  window.ged2dot_setPersonREFN = (refn: string) => {
    navigate(`q?hostname=${refn}`);
  };

  window.ged2dot_setPersonUUID = (uuid: string) => {
    navigate(`q?hostname=${uuid}`);
  };
}

export async function load(depth: any, familyID: any): string {
  try {
    const html = await render(depth, familyID);

    return html;
  } catch (e3) {
    console.log(e3);

    // redirect to empty query to open Line
    await redirect();
  }
}

async function render(depth: any, familyID: any): string {
  // if there's a gedcom file, render tree
  try {
    const html = await renderGed(depth, familyID);

    console.log("set index.ged");

    return html;
  } catch (e1) {
    console.log("no index.ged", e1);
  }

  // if there's an index file, render it as overview
  try {
    const html = await renderIndex();

    console.log("set index.html");

    return html;
  } catch (e2) {
    console.log("no index.html", e2);
  }

  throw "render failed for unknown reason";
}

async function renderGed(depth: any, familyID: any): string {
  const index = await fetchDataMetadir("index.ged");

  // TODO: ged2dot needs to be able to figure out familyID
  // when passed familyID is undefined or non-existing
  const dot = ged2dot(index, depth, familyID);

  // render dot notation with graphviz
  const svg = await graphviz.layout(dot, "svg", "dot");

  return svg;
}

async function renderIndex(): string {
  const index = await fetchDataMetadir("index.html");

  return index;
}

function redirect(): void {
  console.log("redirect to query");

  const navigate = useNavigate();

  navigate(`q`, { replace: true });
}
