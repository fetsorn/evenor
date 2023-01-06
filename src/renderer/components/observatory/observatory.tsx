import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./observatory.module.css";
import {
  Header,
  ObservatoryOverview,
  OverviewType,
  ObservatoryProfile,
  Footer,
} from "..";
import { onUseEffect } from "./tbn";

export default function Observatory() {
  const [schema, setSchema] = useState({});

  const [entry, setEntry] = useState(undefined);

  const [index, setIndex] = useState(undefined);

  const [waypoint, setWaypoint] = useState(undefined);

  const [isEdit, setIsEdit] = useState(false);

  const [isBatch, setIsBatch] = useState(false);

  const [groupBy, setGroupBy] = useState(undefined);

  const [overview, setOverview] = useState([]);

  const [overviewType, setOverviewType] = useState(OverviewType.Itinerary);

  const location = useLocation();

  function onBatchSelect() {
    setIsBatch(true);
  }

  function onEntrySelect(_entry: any, _index: any, _waypoint: any) {
    setEntry(_entry);
    setIndex(_index);
    setWaypoint(_waypoint);
    return;
  }

  function onEntryCreate() {
    return;
  }

  function onEdit() {
    setIsEdit(true);
  }

  function onRevert() {
    setIsEdit(false);
  }

  useEffect(() => {
    onUseEffect(location.search, setGroupBy, setOverview, setSchema);
  }, []);

  return (
    <>
      <Header {...{ schema, groupBy, setGroupBy, setOverviewType }} />

      <main className={styles.main}>
        <ObservatoryOverview
          {...{
            schema,
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
            schema,
            entry,
            index,
            waypoint,
            isBatch,
            isEdit,
            onEdit,
            onRevert,
          }}
        />
      </main>

      <Footer />
    </>
  );
}
