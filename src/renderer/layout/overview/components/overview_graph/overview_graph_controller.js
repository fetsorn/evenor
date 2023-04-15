import { API } from 'lib/api';

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

  const { ged2dot, ged2dot_ } = await import('@fetsorn/ged2dot');

  if (familyID) {
    dot = ged2dot(index, depth, familyID);
  } else {
    dot = ged2dot_(index);
  }

  const { Graphviz } = await import('@hpcc-js/wasm');

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

    return html;
  } catch (e1) {
    console.log('no index.ged', e1);
  }

  // if there's an index file, render it as overview
  try {
    const html = await renderIndex(dir);

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
