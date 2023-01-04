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
