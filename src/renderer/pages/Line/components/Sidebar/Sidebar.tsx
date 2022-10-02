import React, { useEffect, useState, useMemo } from "react";
import cn from "classnames";
import { Title, Paragraph, Button, DropdownMenu } from "../../../../components";
import { TextInput, TextAreaInput, DateInput } from "./components";
import * as csvs from "@fetsorn/csvs-js";
import { useTranslation } from "react-i18next";
import {
  formatDate,
  isIFrameable,
  resolveLFS,
  getRemote,
  toHtml,
  fetchDataMetadir,
  writeDataMetadir,
  fetchAsset,
  uploadFile,
} from "../../../../utils";
import styles from "./Sidebar.module.css";

declare global {
  interface Window {
    buf?: any;
  }
}

interface ISidebarProps {
  event?: any;
  eventIndex?: any;
  isEdit?: boolean;
  setIsEdit?: any;
  isReadOnly?: boolean;
  groupBy?: any;
  data?: any;
  setData?: any;
  rebuildLine?: any;
  /* options?: any; */
  schema?: any;
}

const Sidebar = (props: ISidebarProps) => {
  const {
    event: eventOriginal,
    isEdit,
    setIsEdit,
    isReadOnly,
    eventIndex,
    groupBy,
    data,
    setData,
    /* options, */
    rebuildLine,
    schema,
  } = props;

  const [event, setEvent] = useState(eventOriginal);
  const [iframeFetchPath, setIFrameFetchPath] = useState(undefined);
  const [iframeConvertPath, setIFrameConvertPath] = useState(undefined);
  const { t, i18n } = useTranslation();

  // set iframe blob
  const setIFrameFetch = async (filepath: string) => {
    // fetch FILE_PATH as Blob
    let blob: Blob;
    try {
      const lfsPath = "lfs/" + filepath;
      blob = await fetchAsset(lfsPath);
    } catch (e1) {
      /* console.log("fetch lfs/ failed", e1); */
      try {
        const localPath = "local/" + filepath;
        blob = await fetchAsset(localPath);
      } catch (e2) {
        /* console.log("fetch local/ failed", e2); */
      }
    }
    if (blob) {
      // try LFS
      try {
        const content = await blob.text();
        const remote = await getRemote(window.dir);
        const token = "";
        const blobPath = await resolveLFS(filepath, content, remote, token);
        setIFrameFetchPath(blobPath);
      } catch (e) {
        /* console.log("lfs failed, setting file", e); */
        const url = URL.createObjectURL(blob);
        setIFrameFetchPath(url);
      }
    }
  };

  const onConvert = async () => {
    const localPath = "local/" + event.FILE_PATH;
    const blob = await fetchAsset(localPath);
    const abuf = await blob.arrayBuffer();
    // try to convert to html
    try {
      const html = await toHtml(localPath, abuf);
      const content = new Blob([html]);
      const blobURL = URL.createObjectURL(content);
      setIFrameConvertPath(blobURL);
    } catch (e1) {
      console.log("handleDoc failed", e1);
      // try to fetch plain text
      try {
        // expose buffer to decode alternate encodings in console, e.g.
        /* new TextDecoder("windows-1251").decode(window.buf); */
        window.buf = abuf;
        const text = new TextDecoder("utf-8").decode(abuf);
        const content = new Blob([text]);
        const blobURL = URL.createObjectURL(content);
        setIFrameConvertPath(blobURL);
      } catch (e2) {
        /* console.log("handlePlain failed", e2); */
      }
    }
  };

  const onEdit = async () => {
    setIsEdit(true);
  };

  const onRevert = async () => {
    setEvent(eventOriginal);
    if (!data.find((e: any) => e.UUID === event.UUID)) {
      setEvent(undefined);
    }
    setIsEdit(false);
  };

  const onSave = async () => {
    await csvs.editEvent(event, {
      fetch: fetchDataMetadir,
      write: writeDataMetadir,
      random: () => crypto.randomUUID(),
    });

    let dataNew;
    if (data.find((e: any) => e.UUID === event.UUID)) {
      dataNew = data.map((e: any) => {
        if (e.UUID === event.UUID) {
          return event;
        } else {
          return e;
        }
      });
    } else {
      dataNew = data.concat([event]);
    }

    setData(dataNew);
    setIsEdit(false);
    await rebuildLine(dataNew);
    document.getElementById(event?.UUID).scrollIntoView();
  };

  const onDelete = async () => {
    let dataNew;
    if (data.find((e: any) => e.UUID === event.UUID)) {
      await csvs.deleteEvent(event.UUID, {
        fetch: fetchDataMetadir,
        write: writeDataMetadir,
      });
      dataNew = data.filter((e: any) => e.UUID !== event.UUID);
    } else {
      dataNew = data;
    }

    setData(dataNew);
    setEvent(undefined);
    await rebuildLine(dataNew);
  };

  const notAddedFields = useMemo(
    () =>
      event
        ? Object.keys(schema).filter((prop: any) => {
          return !Object.prototype.hasOwnProperty.call(
            event,
            schema[prop]["label"]
          );
        })
        : [],
    [event]
  );

  const menuItems = useMemo(
    () =>
      notAddedFields.map((prop: any) => {
        const label = schema[prop]["label"];
        const lang = i18n.language;
        const description = schema?.[prop]?.description?.[lang] ?? label;
        return {
          label: description,
          onClick: () => {
            const e = { ...event };
            e[label] = "";
            setEvent(e);
          },
        };
      }),
    /* react-hooks/exhaustive-deps */
    // eslint-disable-next-line
    [notAddedFields]
  );

  const addedFields = useMemo(
    () =>
      event ? Object.keys(event).filter((prop: any) => prop != "UUID") : [],
    [event]
  );

  const generateInput = (label: any, idx: any) => {
    /* console.log(event); */
    const prop = Object.keys(schema).find(
      (prop: any) => schema[prop]["label"] === label
    );
    const root = Object.keys(schema).find(
      (prop: any) =>
        !Object.prototype.hasOwnProperty.call(schema[prop], "parent")
    );

    const lang = i18n.language;
    const description = schema?.[prop]?.description?.[lang] ?? label;

    async function onChange(e: any) {
      const _event = { ...event };
      _event[label] = e.target.value;
      setEvent(_event);
    }

    async function onUpload(e: any) {
      const file: File = e.target.files[0];
      await uploadFile(file);
      const _event = { ...event };
      _event[label] = file.name;
      setEvent(_event);
    }

    async function removeField() {
      const _event = { ...event };
      delete _event[label];
      setEvent(_event);
    }

    async function uploadElectron() {
      const filepath = await window.electron.uploadFile(window.dir);
      const _event = { ...event };
      _event[label] = filepath;
      setEvent(_event);
    }

    /* console.log(label, prop, root); */
    if (prop !== root && schema[prop]["type"] == "date") {
      /* console.log("DATE"); */
      return (
        <DateInput
          key={idx}
          label={description}
          value={event[label] ?? ""}
          onChange={onChange}
          onRemove={removeField}
        />
      );
    } else if (prop !== root) {
      return (
        <div key={idx}>
          <TextInput
            key={idx}
            label={description}
            value={event[label] ?? ""}
            onChange={onChange}
            onRemove={removeField}
          />
          {/* list={`${prop}_list`} */}
          {/* <datalist id={`${prop}_list`}>
              {options[prop]?.map((option: any, idx1: any) => (
              <option key={idx1} value={option} />
              ))}
              </datalist> */}
          {prop == "filepath" &&
            (__BUILD_MODE__ === "electron" ? (
              <Button type="button" onClick={uploadElectron}>
                Upload
              </Button>
            ) : (
              <input type="file" onChange={onUpload} />
            ))}
        </div>
      );
    } else {
      return (
        <TextAreaInput
          key={idx}
          label={description}
          value={event[label] ?? ""}
          onChange={onChange}
          onRemove={removeField}
        />
      );
    }
  };

  const generateOutput = (label: any, idx: any) => {
    const prop = Object.keys(schema).find(
      (prop: any) => schema[prop]["label"] === label
    );
    const lang = i18n.language;
    const description = schema?.[prop]?.description?.[lang] ?? label;
    if (event?.[label])
      return (
        <div>
          <br />
          <div key={`output_${idx}`}>{description}</div>
          <Paragraph key={`label_${idx}`}>{event[label]}</Paragraph>
        </div>
      );
  };

  useEffect(() => {
    if (typeof eventOriginal !== "undefined") {
      setEvent(eventOriginal);
    }

    // reset sidebar contents on event switch
    setIFrameFetchPath(undefined);
    setIFrameConvertPath(undefined);
  }, [eventOriginal]);

  useEffect(() => {
    if (event?.FILE_PATH && isIFrameable(event.FILE_PATH)) {
      setIFrameFetch(event.FILE_PATH);
    }
  }, [event]);

  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !event })}>
      <div className={styles.container}>
        <div id="scrollcontainer" className={styles.sticky}>
          <Title>
            {event && formatDate(event[schema[groupBy]["label"]])}{" "}
            {eventIndex && eventIndex}
          </Title>
          {isEdit ? (
            <div>
              <div className={styles.buttonbar}>
                {event && (
                  <Button
                    type="button"
                    title={t("line.button.revert")}
                    onClick={onRevert}
                  >
                    ↩
                  </Button>
                )}
                {menuItems.length > 0 && (
                  <DropdownMenu
                    title={t("line.dropdown.input")}
                    label="+"
                    menuItems={menuItems}
                  />
                )}
                {event && (
                  <Button
                    type="button"
                    title={t("line.button.save")}
                    onClick={onSave}
                  >
                    💾
                  </Button>
                )}
                {event && (
                  <Button
                    type="button"
                    title={t("line.button.delete")}
                    onClick={onDelete}
                  >
                    🗑️
                  </Button>
                )}
              </div>
              {event && <form>{addedFields.map(generateInput)}</form>}
            </div>
          ) : (
            <div>
              {isReadOnly || (
                <div>
                  {event && (
                    <Button
                      type="button"
                      title={t("line.button.edit")}
                      onClick={onEdit}
                    >
                      ✏️
                    </Button>
                  )}
                </div>
              )}
              <Paragraph>{event?.UUID}</Paragraph>
              {event && <div>{addedFields.map(generateOutput)}</div>}
              {/* {__BUILD_MODE__ !== "server" &&
                  !window.localStorage.getItem("antea_public") &&
                  isIFrameable(event?.FILE_PATH) && (
                  <Button
                  type="button"
                  onClick={async () => {
                  await resolvePathLFS(window.prompt("key"));
                  }}
                  >
                  Show source
                  </Button>
                  )} */}
            </div>
          )}
          {isIFrameable(event?.FILE_PATH) && iframeFetchPath && (
            <Paragraph>
              <iframe
                title="iframe"
                src={iframeFetchPath}
                width="100%"
                height="800px"
              ></iframe>
            </Paragraph>
          )}
          {iframeConvertPath && (
            <Paragraph>
              <iframe
                title="iframe"
                src={iframeConvertPath}
                width="100%"
                height="800px"
              ></iframe>
            </Paragraph>
          )}
          {event?.FILE_PATH &&
            !iframeConvertPath &&
            !isIFrameable(event?.FILE_PATH) && (
            <Button type="button" onClick={onConvert}>
                Convert
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
