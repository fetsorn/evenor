import { Graphviz } from '@hpcc-js/wasm';
import { ged2dot, ged2dot_ } from '@fetsorn/ged2dot';
import { API } from 'lib/api';

export function setupVars(navigate, setFamily) {
  window.ged2dot_setFamilyID = (id) => {
    setFamily(id);
  };

  window.ged2dot_setPersonREFN = (refn) => {
    navigate(`?hostname=${refn}&overviewType=itinerary`);
  };

  window.ged2dot_setPersonUUID = (uuid) => {
    navigate(`?hostname=${uuid}&overviewType=itinerary`);
  };
}

async function renderGed(
  dir,
  depth,
  familyID,
) {
  const api = new API(dir);

  const index = await api.readGedcom();

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
  const svg = graphviz.layout(dot, 'svg', 'dot');

  return svg;
}

async function renderIndex(dir) {
  const api = new API(dir);

  const index = await api.readIndex();

  return index;
}

async function render(dir, depth, familyID) {
  // if there's a gedcom file, render tree
  try {
    const html = await renderGed(dir, depth, familyID);

    console.log('set index.ged');

    return html;
  } catch (e1) {
    console.log('no index.ged', e1);
  }

  // if there's an index file, render it as overview
  try {
    const html = await renderIndex(dir);

    console.log('set index.html');

    return html;
  } catch (e2) {
    console.log('no index.html', e2);
  }

  throw Error('render failed for unknown reason');
}

export async function load(
  dir,
  depth,
  familyID,
) {
  try {
    const html = await render(dir, depth, familyID);

    return html;
  } catch (e3) {
    console.log(e3);

    return undefined;
  }
}
