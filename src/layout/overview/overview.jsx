import React, { Suspense } from 'react';
import { OverviewFilter } from './components/overview_filter/overview_filter.jsx';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/index.js';
import {
  Button,
} from '../../components/index.js';

const OverviewItinerary = React.lazy(() => import('./components/overview_itinerary/index.js'));

export function Overview() {
	const { t } = useTranslation();

	const [
		isView,
		repoUUID,
		repoName,
		setRepoUUID,
		onSettingsOpen,
	  ] = useStore((state) => [
		state.isView,
		state.repoUUID,
		state.repoName,
		state.setRepoUUID,
		state.onSettingsOpen,
	  ]);

	  function onHome() {
    
		setRepoUUID('root');
	  }

      return (
        <div>
			<div>
			{ (!isView)
         && repoUUID !== 'root'
        ? (
          <Button
            type="button"
            title={t('header.button.back')}
            onClick={() => onHome()}
			>
            {/* &lt;= */}
            🏠
            {repoName}
          </Button>
        )
        : <div />}

		{ repoUUID !== 'root' && (!isView) && (
				<Button
				type="button"
				title={t('header.button.back')}
				onClick={onSettingsOpen}
				>
				⚙️
				</Button>
			)}
			</div>
			<OverviewFilter/>
			<Suspense><OverviewItinerary /></Suspense>
        </div>
      );
}
