import React from "react";
import { RSS, Remote, Sync, Zip, Local, TG } from "./components/index.js";

export function Dispenser({ baseEntry, branchEntry }) {
  switch (branchEntry._) {
    case "sync_tag":
      return <Sync {...{ baseEntry, branchEntry }} />;

    case "remote_tag":
      return <Remote {...{ baseEntry, branchEntry }} />;

    case "rss_tag":
      return <RSS {...{ baseEntry, branchEntry }} />;

    case "zip_tag":
      return <Zip {...{ baseEntry, branchEntry }} />;

    case "local_tag":
      return <Local {...{ baseEntry, branchEntry }} />;

    case "tg_tag":
      return <TG {...{ baseEntry, branchEntry }} />;

    default:
  }
}
