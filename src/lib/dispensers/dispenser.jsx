import React from 'react';
import { RSS } from './rss.jsx';
import { Remote } from './remote.jsx';
import { Sync } from './sync.jsx';
import { Zip } from './zip.jsx';
import { Local } from './local.jsx';

export function Dispenser({ baseEntry, branchEntry }) {
  switch (branchEntry._) {
    case 'sync_tag':
      return (<Sync {...{ baseEntry, branchEntry }} />);

    case 'remote_tag':
      return (<Remote {...{ baseEntry, branchEntry }} />);

    case 'rss_tag':
      return (<RSS {...{ baseEntry, branchEntry }} />);

    case 'zip_tag':
      return (<Zip {...{ baseEntry, branchEntry }} />);

    case 'local_tag':
      return (<Local {...{ baseEntry, branchEntry }} />);

    default:
  }
}
