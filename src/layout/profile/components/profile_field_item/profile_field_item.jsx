import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { ProfileRecord, ProfileValue } from "../index.js";

export function ProfileFieldItem(props) {
  const { store } = useContext(StoreContext);

  // if base has no leaves, show value
  // otherwise show record with buttons that can add leaves
  const baseIsTwig = () => {
    if (store.schema === undefined || store.schema[props.branch] === undefined)
      return true;

    return store.schema[props.branch].leaves.length === 0;
  };

  return (
    <Switch
      fallback={
        <ProfileRecord
          index={`${props.index}-${props.item[props.item._]}`}
          record={props.item}
          path={props.path}
        />
      }
    >
      <Match when={baseIsTwig()}>
        <ProfileValue
          // if twig is object, pass base value
          // otherwise pass string
          value={
            typeof props.item === "object"
              ? props.item[props.branch]
              : props.item
          }
          branch={props.branch}
          path={props.path}
        />
      </Match>
    </Switch>
  );
}
