import React from "react";
import { OverviewType, useStore } from "../../store"
import { OverviewItinerary, OverviewGraph, OverviewBook, OverviewGallery, OverviewListing } from "./components";

export default function Overview() {
  const overviewType = useStore((state) => state.overviewType)

  switch (overviewType) {
  case OverviewType.itinerary:
    return (
      <OverviewItinerary />
    );

    /* case OverviewType.graph:
     *   return <OverviewGraph />; */

    /* case OverviewType.book:
     *   return <OverviewBook />; */

    /* case OverviewType.gallery:
     *   return <OverviewGallery />; */

    /* case OverviewType.listing:
     *   return <OverviewListing />; */

  default:
    return <>no overview type chosen</>;
  }
}
