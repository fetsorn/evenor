import {
  fetchDataMetadir,
  gitInit,
  exportPDF,
  generateLatex,
} from "../../utils";
import { digestMessage } from "@fetsorn/csvs-js";

// pick a param to group data by
function defaultGroupBy(schema: any, data: any, search: any) {
  // fallback to groupBy param from the search query
  const searchParams = new URLSearchParams(search);
  if (searchParams.has("groupBy")) {
    return searchParams.get("groupBy");
  }

  let groupBy_prop;
  const car = data[0] ?? {};
  // fallback to first date param present in data
  groupBy_prop = Object.keys(schema).find((prop: any) => {
    const prop_label = schema[prop]["label"] ?? prop;
    return (
      schema[prop]["type"] === "date" &&
      Object.prototype.hasOwnProperty.call(car, prop_label)
    );
  });
  // fallback to first param present in data
  if (!groupBy_prop) {
    groupBy_prop = Object.keys(schema).find((prop: any) => {
      const prop_label = schema[prop]["label"] ?? prop;
      return Object.prototype.hasOwnProperty.call(car, prop_label);
    });
  }
  // fallback to first date param present in schema
  if (!groupBy_prop) {
    groupBy_prop = Object.keys(schema).find(
      (prop: any) => schema[prop]["type"] === "date"
    );
  }
  // fallback to first param present in schema
  if (!groupBy_prop) {
    groupBy_prop = Object.keys(schema)[0];
  }
  // unreachable with a valid scheme
  // fallback to empty string
  if (!groupBy_prop) {
    groupBy_prop = "";
  }
  return groupBy_prop;
}

const handleOpenEvent = async (event: any, index: any) => {
  setEvent(event);
  setEventIndex(index);
};

const addEvent = async (date: string, index: string) => {
  const _event: Record<string, string> = {};

  // file event with a random UUID
  _event.UUID = await digestMessage(crypto.randomUUID());
  _event.DATUM = "";

  // fill event with the date from which it was pulled
  const groupBy_label = schema[groupBy]["label"] ?? groupBy;
  _event[groupBy_label] = date ?? "0000-00-00";

  // fill event with values from search query
  Object.keys(schema).map((prop: any) => {
    const label = schema[prop]["label"] ?? prop;
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has(prop)) {
      _event[label] = searchParams.get(prop);
    }
  });

  setEventIndex(index);
  setEvent(_event);
  setIsEdit(true);
};

const exportLine = async () => {
  const textext = generateLatex(data);
  const pdfURL = await exportPDF(textext);
  /* const link = document.createElement("a"); */
  if (__BUILD_MODE__ === "electron") {
    await window.electron.openPDF(pdfURL);
    /* await window.electron.writeDataMetadir(window.dir, "aaa", "aaa"); */
  } else {
    const w = window.open(pdfURL, "_blank");
    w && w.focus();
  }
};

const rebuildLine = async (
  _data: any = data,
  _schema: any = schema,
  _groupBy: any = groupBy
) => {
  const groupBy_label: any = _schema[_groupBy]["label"] ?? _groupBy;
  let _line: any;
  try {
    _line = await queryWorker.buildLine(_data, groupBy_label);
  } catch (e) {
    console.log("failed to rebuild line", e);
  }
  console.log("received build result", _line);
  setLine(_line);
};

const reloadPage = async (
  searchParams = new URLSearchParams(location.search)
) => {
  setIsLoading(true);

  gitInit(location.pathname);

  /* console.log("called worker to query"); */
  let _data: any = [];
  try {
    _data = await queryWorker.queryMetadir(searchParams);
  } catch (e: any) {
    console.log("query fails", e);
  }

  console.log("received query result", _data);

  const _schema = JSON.parse(await fetchDataMetadir("metadir.json"));

  const _groupBy = groupBy ?? defaultGroupBy(_schema, _data, location.search);
  setGroupBy(_groupBy);

  setSchema(_schema);
  setData(_data);

  /* console.log("getOptions"); */
  const _options: any = {};
  const root = Object.keys(_schema).find(
    (prop: any) =>
      !Object.prototype.hasOwnProperty.call(_schema[prop], "parent")
  );
  for (const prop of Object.keys(_schema)) {
    /* const propType = _schema[prop]["type"]; */
    if (/* propType != "date" && */ prop != root) {
      try {
        const res = await queryWorker.queryOptions(prop);
        _options[prop] = res;
        /* console.log("getOption", prop, res); */
      } catch (e) {
        console.log(e);
      }
    }
  }

  setOptions(_options);

  await rebuildLine(_data, _schema, _groupBy);

  setIsLoading(false);
};

// TODO: if build mode is server, navigate to server/
// but do not just always navigate to server/ to allow for custom server URLs
function redirectToServer() {
  if (__BUILD_MODE__ === "server") {
    try {
      navigate("server/");
    } catch {
      return;
    }
  }
}

// try to login read-only to a public repo from address bar
function tryShow() {
  // remove url from address bar
  /* window.history.replaceState(null, null, "/"); */
  try {
    // check if path is a url
    new URL(barUrl);
  } catch (e) {
    console.log("not a url", barUrl, e);
    return;
  }

  try {
    await rimraf("/show");
  } catch (e) {
    console.log("nothing to remove");
  }

  try {
    await clone(barUrl, barToken, "show");
  } catch (e) {
    await rimraf("/show");
    console.log("couldn't clone from url", barUrl, e);
    return;
  }

  navigate("show/");
}

function redirectToBarURL() {
  // read url from path
  const searchParams = new URLSearchParams(location.search);
  if (searchParams.has("url")) {
    const barUrl = searchParams.get("url");
    const barToken = searchParams.get("token") ?? "";

    // try to login read-only to a public repo from address bar
    await tryShow();
  }
}
