import React from "react";
import { OverviewItinerary, OverviewGraph } from "..";

interface IObservatoryOverviewProps {
  data: any;
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
  data,
  overviewType,
  onEntrySelect,
  onEntryCreate,
  onBatchSelect,
}: IObservatoryOverviewProps) {
  switch (overviewType) {
    case OverviewType.Itinerary:
      return (
        <OverviewItinerary
          {...{ data, onEntrySelect, onEntryCreate, onBatchSelect }}
        />
      );

    case OverviewType.Graph:
      return <OverviewGraph {...{ data, onEntrySelect }} />;

    default:
      return <>no overview type chosen</>;
  }
}
