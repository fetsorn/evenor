import { RSS } from "./rss";
import { Remote } from "./remote";
import { Sync } from "./sync";
import { Local } from "./local";

interface IDispenserProps {
  baseEntry: any;
  branchEntry: any;
}

export default function Dispenser({ baseEntry, branchEntry }: IDispenserProps) {

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
