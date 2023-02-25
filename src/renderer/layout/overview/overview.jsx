import React, { Suspense } from 'react';
import { OverviewType, useStore } from '@/store/index.js';

const OverviewItinerary = React.lazy(() => import('./components/overview_itinerary/index.js'));
const OverviewBook = React.lazy(() => import('./components/overview_book/index.js'));
const OverviewGraph = React.lazy(() => import('./components/overview_graph/index.js'));

export function Overview() {
  const overviewType = useStore((state) => state.overviewType);

  switch (overviewType) {
    case OverviewType.itinerary:
      return (
        <Suspense>
          <OverviewItinerary />
        </Suspense>
      );

    case OverviewType.graph:
      return (
        <Suspense>
          <OverviewGraph />
        </Suspense>
      );

    case OverviewType.book:
      return (
        <Suspense>
          <OverviewBook />
        </Suspense>
      );

      /* case OverviewType.gallery:
     *   return <OverviewGallery />; */

      /* case OverviewType.listing:
     *   return <OverviewListing />; */

    default:
      return <>no overview type chosen</>;
  }
}
