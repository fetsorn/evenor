import { graphviz } from "@hpcc-js/wasm";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchDataMetadir,
  gitInit, // exportPDF, emptyLaTeX
} from "../../workers/git";
import { ged2dot, ged2dot_ } from "@fetsorn/ged2dot";

declare global {
  interface Window {
    ged2dot_setFamilyID?: any;
    ged2dot_setPersonREFN?: any;
    ged2dot_setPersonUUID?: any;
  }
}

export function setupVars() {
  const navigate = useNavigate();

  window.ged2dot_setFamilyID = (id: string) => {
    // setFamilyID(id);
  };

  window.ged2dot_setPersonREFN = (refn: string) => {
    navigate(`q?hostname=${refn}`);
  };

  window.ged2dot_setPersonUUID = (uuid: string) => {
    navigate(`q?hostname=${uuid}`);
  };
}

export async function load(depth: any, familyID: any) {
  gitInit(location.pathname);

  // setIsLoading(true);

  try {
    const html = await render(depth, familyID);

    // setIsLoading(false);

    return html;
  } catch (e3) {
    console.log(e3);

    // redirect to empty query to open Line
    await redirect();
  }
}

async function render(depth: any, familyID: any) {
  // if there's a gedcom file, render tree
  try {
    const html = await renderGed(depth, familyID);

    console.log("set index.ged");

    // setIsTree(true);

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

async function renderGed(depth: any, familyID: any) {
  const index = await fetchDataMetadir("index.ged");

  // TODO: ged2dot needs to be able to figure out familyID
  // when passed familyID is undefined or non-existing
  const dot = ged2dot(index, depth, familyID);

  // render dot notation with graphviz
  const svg = await graphviz.layout(dot, "svg", "dot");

  return svg;
}

async function renderIndex() {
  const index = await fetchDataMetadir("index.html");

  return index;
}

function redirect() {
  console.log("redirect to query");
  const navigate = useNavigate();

  navigate(`q`, { replace: true });
}
