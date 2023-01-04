import React from "react";
import {
  Header,
  ObservatoryOverview,
  OverviewType,
  ObservatoryProfile,
  Footer,
} from "..";

export default function Observatory() {
  const [schema, setSchema] = useState({});

  const [entry, setEntry] = useState(false);

  const [index, setIndex] = useState(false);

  const [waypoint, setWaypoint] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [isBatch, setIsBatch] = useState(false);

  const [overviewType, setOverviewType] = useState(OverviewType.Itinerary);

  const [data, setData] = useState([]);

  function onBatchSelect() {
    setIsBatch(true);
  }

  function onEntrySelect(_entry, _index, _waypoint) {
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

  return (
    <>
      <Header {...{ setOverviewType }} />

      <main className={styles.main}>
        <ObservatoryOverview
          {...{
            data,
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
