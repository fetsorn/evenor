import { RSS } from "./rss.jsx";
import { Remote } from "./remote.jsx";
import { Sync } from "./sync.jsx";
import { Local } from "./local.jsx";

export default function Dispenser({ baseEntry, branchEntry }) {

  switch (branchEntry['|']) {
  case "local_tag":
    return (<Local {...{ baseEntry, branchEntry }}/>)

  case "sync_tag":
    return (<Sync {...{ baseEntry, branchEntry }}/>)

  case "remote_tag":
    return (<Remote {...{ baseEntry, branchEntry }}/>)

  case "rss_tag":
    return (<RSS {...{ baseEntry, branchEntry }}/>)

  default:
    return (
      <></>
    )
  }
}
