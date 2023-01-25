import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import styles from "./root.module.css";
import {
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
  getDefaultGroupBy,
} from "../store";
import {
  default as ObservatoryOverview,
  OverviewType,
} from "./overview";
import { default as ObservatoryProfile } from "./profile";
import { default as Header } from "./header";
import { default as Footer } from "./footer";

export default function Root() {
  return (
    <Router>
      <Routes>
        <Route index element={<Observatory />} />
        <Route path=":repoRoute" element={<Observatory />} />
      </Routes>
    </Router>
  );
}

function Observatory() {
  const { repoRoute } = useParams();

  const [entry, setEntry] = useState(undefined);

  const [index, setIndex] = useState(undefined);

  const [group, setGroup] = useState(undefined);

  const [groupBy, setGroupBy] = useState(undefined);

  const [schema, setSchema] = useState<any>({});

  const [overview, setOverview] = useState([]);

  const [isEdit, setIsEdit] = useState(false);

  const [isBatch, setIsBatch] = useState(false);

  const [overviewType, setOverviewType] = useState(OverviewType.itinerary);

  const [isLoaded, setIsLoaded] = useState(false);

  const location = useLocation();

  const navigate = useNavigate();

  function onBatchSelect() {
    setIsBatch(true);
  }

  function onEntrySelect(entryNew: any, indexNew: any, groupNew: any) {
    setEntry(entryNew);

    setIndex(indexNew);

    setGroup(groupNew);

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

  function onChangeGroupBy(groupByNew: string) {
    const groupByProp =
      Object.keys(schema).find((p) => schema[p].label === groupByNew) ??
      groupByNew;

    const searchParams = new URLSearchParams(location.search);

    searchParams.set("groupBy", groupByProp);

    navigate({
      pathname: location.pathname,
      search: "?" + searchParams.toString(),
    });
  }

  function onChangeOverviewType(overviewTypeNew: string) {
    const searchParams = new URLSearchParams(location.search);

    searchParams.set("overviewType", overviewTypeNew);

    navigate({
      pathname: location.pathname,
      search: "?" + searchParams.toString(),
    });
  }

  async function onChangeQuery(searchString: string) {
    const overviewNew = await searchRepo(repoRoute, searchString);

    setOverview(overviewNew);
  }

  async function onLocation() {
    const searchParams = new URLSearchParams(location.search);

    const overviewTypeNew = searchParams.get(
      "overviewType"
    ) as keyof typeof OverviewType;

    if (overviewTypeNew) {
      setOverviewType(OverviewType[overviewTypeNew]);
    }

    if (isLoaded) {
      const groupByNew = getDefaultGroupBy(schema, overview, location.search);

      setGroupBy(groupByNew);
    }
  }

  async function onUseEffect() {
    if (repoRoute === undefined) {
      await ensureRoot();
    }

    const schemaNew = await fetchSchema(repoRoute);

    const overviewNew = await searchRepo(repoRoute, location.search);

    const groupByNew = getDefaultGroupBy(
      schemaNew,
      overviewNew,
      location.search
    );

    setSchema(schemaNew);

    setGroupBy(groupByNew);

    setOverview(overviewNew);

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
      <Header
        {...{
          isLoaded,
          schema,
          groupBy,
          onChangeQuery,
          onChangeGroupBy,
          overviewType,
          onChangeOverviewType,
        }}
      />
      <main className={styles.main}>
        <ObservatoryOverview
          {...{
            groupBy,
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
