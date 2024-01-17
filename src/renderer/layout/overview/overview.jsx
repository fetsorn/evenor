import React, { Suspense } from 'react';

const OverviewItinerary = React.lazy(() => import('./components/overview_itinerary/index.js'));

export function Overview() {

      return (
        <Suspense>
          <OverviewItinerary />
        </Suspense>
      );
}
