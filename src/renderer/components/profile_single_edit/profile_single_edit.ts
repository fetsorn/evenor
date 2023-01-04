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

const addedFields = useMemo(
  () => (event ? Object.keys(event).filter((prop: any) => prop != "UUID") : []),
  [event]
);

function formatTitle() {
  {
    event && formatDate(event[schema[groupBy]["label"]]);
  }
  {
    (" ");
  }
  {
    eventIndex && eventIndex;
  }
}

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

const onRevert = async () => {
  setEvent(eventOriginal);
  if (!data.find((e: any) => e.UUID === event.UUID)) {
    setEvent(undefined);
  }
  setIsEdit(false);
};

const generateInput = (label: any, idx: any) => {
  /* console.log(event); */
  const prop = Object.keys(schema).find(
    (prop: any) => schema[prop]["label"] === label
  );
  const root = Object.keys(schema).find(
    (prop: any) => !Object.prototype.hasOwnProperty.call(schema[prop], "parent")
  );

  const lang = i18n.resolvedLanguage;
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
              {t("line.button.upload")}
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
