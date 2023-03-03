import React from 'react';
import { RSS } from './rss.jsx';
import { Remote } from './remote.jsx';
import { Sync } from './sync.jsx';

export function Dispenser({ baseEntry, branchEntry }) {
  switch (branchEntry._) {
    case 'sync_tag':
      return (<Sync {...{ baseEntry, branchEntry }} />);

    case 'remote_tag':
      return (<Remote {...{ baseEntry, branchEntry }} />);

    case 'rss_tag':
      return (<RSS {...{ baseEntry, branchEntry }} />);

    default:
  }
}
