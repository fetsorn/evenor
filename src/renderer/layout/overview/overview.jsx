import React, { Suspense } from 'react';
import { OverviewType, useStore } from '../../../store/store/index.js';

const OverviewItinerary = React.lazy(() => import('./components/overview_itinerary/index.js'));
const OverviewBook = React.lazy(() => import('./components/overview_book/index.js'));
const OverviewGraph = React.lazy(() => import('./components/overview_graph/index.js'));
const OverviewListing = React.lazy(() => import('./components/overview_listing/index'))
const OverviewChat = React.lazy(() => import('./components/overview_chat/index'))
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

    case OverviewType.listing:
      return (<Suspense>
                <OverviewListing />
              </Suspense>);

    case OverviewType.chat:
      return (<Suspense>
                <OverviewChat />
              </Suspense>);

      /* case OverviewType.gallery:
     *   return <OverviewGallery />; */


    default:
      return <>no overview type chosen</>;
  }
}
