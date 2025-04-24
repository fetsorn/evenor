import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { ProfileRecord } from "./components/index.js";

export function Profile() {
  const { store } = useContext(StoreContext);

  return <ProfileRecord index="_" record={store.record} path={["record"]} />;
}
