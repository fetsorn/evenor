import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header, Main, Footer } from "../../components";
import { useLocation } from "react-router-dom";
import { Sidebar, Row, Timeline, VirtualScroll } from "./components";
import { useWindowSize, useMedia } from "../../hooks";
import { REM_DESKTOP, REM_MOBILE } from "../../constants";
import {
  fetchDataMetadir,
  gitInit,
  exportPDF,
  generateLatex,
} from "../../utils";
import { queryWorkerInit } from "../../workers";
import { digestMessage } from "@fetsorn/csvs-js";
import rowStyles from "./components/Row/Row.module.css";

const rowHeights = {
  mobile: 40,
  desktop: 40,
};

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

const Line = () => {
  const [data, setData] = useState<any[]>([]);
  const [line, setLine] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState(undefined);
  const [eventIndex, setEventIndex] = useState(undefined);
  const [schema, setSchema] = useState<any>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const location = useLocation();
  const [options, setOptions]: any[] = useState({});

  const { width: viewportWidth } = useWindowSize();
  const isMobile = useMedia("(max-width: 600px)");
  const { t } = useTranslation();

  const rowHeight = useMemo(
    () =>
      isMobile
        ? Math.round((viewportWidth / 100) * REM_MOBILE * rowHeights.mobile)
        : Math.round((viewportWidth / 100) * REM_DESKTOP * rowHeights.desktop),
    [viewportWidth, isMobile]
  );

  const queryWorker = queryWorkerInit();

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

  useEffect(() => {
    reloadPage();
  }, [groupBy]);

  useEffect(() => {
    if (window.dir == "show") {
      setIsReadOnly(true);
    }
  }, []);

  return (
    <>
      <Header
        schema={schema}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        options={options}
        reloadPage={reloadPage}
        exportPage={exportLine}
      />
      <Main>
        {isLoading && <p>{t("line.label.loading")}</p>}
        <Timeline>
          {!data.length && (
            <button
              className={rowStyles.star}
              style={{ backgroundColor: "blue" }}
              type="button"
              onClick={() => addEvent("", "1")}
              title={t("line.button.add")}
              key="addevent"
            >
              +
            </button>
          )}
          <VirtualScroll
            data={line}
            rowComponent={Row}
            rowHeight={rowHeight}
            onEventClick={handleOpenEvent}
            addEvent={addEvent}
          />
        </Timeline>
        <Sidebar
          event={event}
          eventIndex={eventIndex}
          isReadOnly={isReadOnly}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          groupBy={groupBy}
          data={data}
          setData={setData}
          rebuildLine={rebuildLine}
          schema={schema}
        />
      </Main>
      <Footer />
    </>
  );
};

export default Line;
