import React, { Suspense } from 'react';
import { useStore } from '@/store/index.js';

const ProfileSingleEdit = React.lazy(() => import('./components/profile_single_edit/index.js'));
const ProfileSingleView = React.lazy(() => import('./components/profile_single_view/index.js'));
const ProfileBatchEdit = React.lazy(() => import('./components/profile_batch_edit/index.js'));
const ProfileBatchView = React.lazy(() => import('./components/profile_batch_view/index.js'));

export function Profile() {
  const [isBatch, isEdit] = useStore((state) => [state.isBatch, state.isEdit]);

  return (
    <Suspense>
      {isBatch ? (
        isEdit ? (
          <ProfileBatchEdit />
        ) : (
          <ProfileBatchView />
        )
      ) : isEdit ? (
        <ProfileSingleEdit />
      ) : (
        <ProfileSingleView />
      )}
    </Suspense>
  );
}
