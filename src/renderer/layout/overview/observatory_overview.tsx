import React from "react";
import { OverviewItinerary, OverviewGraph } from "./components";

interface IObservatoryOverviewProps {
  groupBy: any;
  overview: any;
  overviewType: any;
  onEntrySelect: any;
  onEntryCreate: any;
  onBatchSelect: any;
}

export enum OverviewType {
  itinerary = "itinerary",
  graph = "graph",
}

export default function ObservatoryOverview({
  groupBy,
  overview,
  overviewType,
  onEntrySelect,
  onEntryCreate,
  onBatchSelect,
}: IObservatoryOverviewProps) {
  switch (overviewType) {
    case OverviewType.itinerary:
      return (
        <OverviewItinerary
          {...{
            groupBy,
            overview,
            onEntrySelect,
            onEntryCreate,
            onBatchSelect,
          }}
        />
      );

    /* case OverviewType.graph:
     *   return <OverviewGraph {...{ data, onEntrySelect }} />; */

    default:
      return <>no overview type chosen</>;
  }
}
