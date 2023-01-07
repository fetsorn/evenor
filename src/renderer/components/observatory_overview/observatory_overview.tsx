import React from "react";
import { OverviewItinerary, OverviewGraph } from "..";

interface IObservatoryOverviewProps {
  overview: any;
  overviewType: any;
  onEntrySelect: any;
  onEntryCreate: any;
  onBatchSelect: any;
}

export enum OverviewType {
  Itinerary,
  Graph,
}

export default function ObservatoryOverview({
  overview,
  overviewType,
  onEntrySelect,
  onEntryCreate,
  onBatchSelect,
}: IObservatoryOverviewProps) {
  switch (overviewType) {
    case OverviewType.Itinerary:
      return (
        <OverviewItinerary
          {...{
            overview,
            onEntrySelect,
            onEntryCreate,
            onBatchSelect,
          }}
        />
      );

    /* case OverviewType.Graph:
     *   return <OverviewGraph {...{ data, onEntrySelect }} />; */

    default:
      return <>no overview type chosen</>;
  }
}
