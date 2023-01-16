import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import styles from "./observatory.module.css";
import {
  Header,
  ObservatoryOverview,
  OverviewType,
  ObservatoryProfile,
  Footer,
  ensureRoot,
  searchRepo,
  fetchSchema,
  uploadFile,
  updateOverview,
  createEntry,
  editEntry,
  deleteEntry,
  addProp,
  deepClone,
} from "..";

export default function Observatory() {
  const { repoRoute } = useParams();

  const [entry, _setEntry] = useState(undefined);

  const [index, setIndex] = useState(undefined);

  const [group, setGroup] = useState(undefined);

  const [schema, setSchema] = useState(undefined);

  const [overview, setOverview] = useState([]);

  const [isEdit, setIsEdit] = useState(false);

  const [isBatch, setIsBatch] = useState(false);

  const [overviewType, setOverviewType] = useState(OverviewType.Itinerary);

  const [isLoaded, setIsLoaded] = useState(false);

  const location = useLocation();

  function setEntry(e: any) {
    _setEntry(e);
  }

  function onBatchSelect() {
    setIsBatch(true);
  }

  function onEntrySelect(entryNew: any, _index: any, _group: any) {
    setEntry(entryNew);

    setIndex(_index);

    setGroup(_group);

    return;
  }

  async function onEntryCreate(index: string) {
    const entryNew = await createEntry();

    setIndex(index);

    setIsEdit(true);

    setEntry(entryNew);
  }

  async function onSave() {
    await editEntry(repoRoute, deepClone(entry));

    const overviewNew = updateOverview(overview, deepClone(entry));

    setOverview(overviewNew);

    setIsEdit(false);

    document.getElementById(entry.UUID).scrollIntoView();
  }

  function onEdit() {
    setIsEdit(true);
  }

  function onRevert() {
    setIsEdit(false);
  }

  async function onDelete() {
    const overviewNew = await deleteEntry(repoRoute, overview, entry);

    setOverview(overviewNew);

    setEntry(undefined);
  }

  function onClose() {
    setEntry(undefined);
  }

  async function onAddProp(label: string) {
    const entryNew = await addProp(schema, deepClone(entry), label);

    setEntry(entryNew);
  }

  function onInputChange(label: string, value: string) {
    const entryNew = deepClone(entry);

    entryNew[label] = value;

    setEntry(entryNew);
  }

  async function onInputUpload(label: string, file: any) {
    await uploadFile(repoRoute, file);

    const entryNew = deepClone(entry);

    entryNew[label] = file.name;

    setEntry(entryNew);
  }

  function onInputRemove(label: string) {
    const entryNew = deepClone(entry);

    delete entryNew[label];

    setEntry(entryNew);
  }

  async function onInputUploadElectron(label: string) {
    const filepath = await window.electron.uploadFile(repoRoute);

    const entryNew = deepClone(entry);

    entryNew[label] = filepath;

    setEntry(entryNew);
  }

  async function onLocation() {
    if (isLoaded) {
      const _overview = await searchRepo(repoRoute, location.search);

      setOverview(_overview);

      // TODO: resolve overview type from searchParams
      setOverviewType(OverviewType.Itinerary);
    }
  }

  async function onUseEffect() {
    if (repoRoute === undefined) {
      await ensureRoot();
    }

    const _overview = await searchRepo(repoRoute, location.search);

    setOverview(_overview);

    const _schema = await fetchSchema(repoRoute);

    setSchema(_schema);

    setIsLoaded(true);
  }

  useEffect(() => {
    onLocation();
  }, [location]);

  useEffect(() => {
    onUseEffect();
  }, []);

  return (
    <>
      <Header {...{ schema }} />

      <main className={styles.main}>
        <ObservatoryOverview
          {...{
            overview,
            overviewType,
            onEntrySelect,
            onEntryCreate,
            onBatchSelect,
          }}
        />

        <ObservatoryProfile
          {...{
            entry,
            schema,
            index,
            group,
            isBatch,
            isEdit,
            onSave,
            onEdit,
            onClose,
            onRevert,
            onDelete,
            onAddProp,
            onInputChange,
            onInputRemove,
            onInputUpload,
            onInputUploadElectron,
          }}
        />
      </main>

      <Footer />
    </>
  );
}
