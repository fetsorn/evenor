import { isTwig } from "./pure.js";
import { newUUID } from "./action.js";
import {
  StoreContext,
  store,
  onSearch,
  onLaunch,
  onRecordEdit,
  onRecordSave,
  onRecordWipe,
  onRepoChange,
} from "./crud.js";

export default {
  StoreContext,
  store,
  onSearch,
  onLaunch,
  onRecordEdit,
  onRecordSave,
  onRecordWipe,
  onRepoChange,
  isTwig,
  newUUID,
};
