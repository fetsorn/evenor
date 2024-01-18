import React, { Suspense } from 'react';
import { OverviewFilter } from './components/overview_filter/overview_filter.jsx';

const OverviewItinerary = React.lazy(() => import('./components/overview_itinerary/index.js'));

export function Overview() {

      return (
        <Suspense>
		<OverviewFilter/>
		<OverviewItinerary />
        </Suspense>
      );
}
