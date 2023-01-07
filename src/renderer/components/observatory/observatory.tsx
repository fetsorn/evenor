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
} from "..";

export default function Observatory() {
  const { repoRoute } = useParams();

  const [entry, setEntry] = useState(undefined);

  const [index, setIndex] = useState(undefined);

  const [group, setGroup] = useState(undefined);

  const [overview, setOverview] = useState([]);

  const [isBatch, setIsBatch] = useState(false);

  const [overviewType, setOverviewType] = useState(OverviewType.Itinerary);

  const [isLoaded, setIsLoaded] = useState(false);

  const location = useLocation();

  function onBatchSelect() {
    setIsBatch(true);
  }

  function onEntrySelect(_entry: any, _index: any, _group: any) {
    setEntry(_entry);

    setIndex(_index);

    setGroup(_group);

    return;
  }

  function onEntryCreate() {
    // create entity in repo
    // if route is root, create repo
    return;
  }

  function onSave() {
    // edit entity in repo
    // if route is root, create repo
    return;
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
      <Header />

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
            index,
            group,
            isBatch,
            onSave,
          }}
        />
      </main>

      <Footer />
    </>
  );
}
