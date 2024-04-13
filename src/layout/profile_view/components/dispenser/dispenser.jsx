import React from "react";
import {
  RSS,
  schemaRSS,
  Remote,
  schemaRemote,
  Sync,
  schemaSync,
  Zip,
  schemaZip,
  Local,
  schemaLocal,
  TG,
  schemaTG
} from "./components/index.js";

export const schemaDispenser = {
  ...schemaRemote,
  ...schemaRSS,
  ...schemaLocal,
  ...schemaZip,
  ...schemaTG,
}

export function Dispenser({ baseRecord, branchRecord }) {
  switch (branchRecord._) {
    case "sync_tag":
      return <Sync {...{ baseRecord, branchRecord }} />;

    case "remote_tag":
      return <Remote {...{ baseRecord, branchRecord }} />;

    case "rss_tag":
      return <RSS {...{ baseRecord, branchRecord }} />;

    case "zip_tag":
      return <Zip {...{ baseRecord, branchRecord }} />;

    case "local_tag":
      return <Local {...{ baseRecord, branchRecord }} />;

    case "tg_tag":
      return <TG {...{ baseRecord, branchRecord }} />;

    default:
  }
}
