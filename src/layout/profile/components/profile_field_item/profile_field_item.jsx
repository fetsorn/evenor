import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { ProfileRecord, ProfileValue } from "../index.js";

export function ProfileFieldItem(props) {
  const { store } = useContext(StoreContext);

  // if branch has no leaves, show value
  // otherwise show record with buttons that can add leaves
  const branchIsTwig = () => {
    if (store.schema === undefined || store.schema[props.branch] === undefined)
      return true;

    return store.schema[props.branch].leaves.length === 0;
  };

  if (branchIsTwig()) {
    // if twig is object, pass base value
    // otherwise pass string
    const value =
      typeof props.item === "object" ? props.item[props.branch] : props.item;

    return <ProfileValue value={value} path={props.path} />;
  }

  return (
    <ProfileRecord
      index={`${props.index}-${props.item[props.item._]}`}
      record={props.item}
      path={props.path}
    />
  );
}
