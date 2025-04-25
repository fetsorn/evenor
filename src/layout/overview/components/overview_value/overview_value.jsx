import { createSignal, useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { Spoiler } from "@/layout/components/index.js";

export function OverviewValue(props) {
  const { store } = useContext(StoreContext);

  const [isValue, setIsValue] = createSignal(true);

  // TODO: add schema[base].cognate from branch-cognate.csv
  const basePartial =
    props.branch === store.searchParams.get("_") ? [] : [props.branch];

  const foo = store.schema[props.branch].trunks.some((t) =>
    store.schema[cognate].trunks.includes(t),
  );

  const cognatePartial = (store.schema[props.branch].cognates ?? []).concat(
    basePartial,
  );

  const recurses = cognatePartial.filter((cognate) =>
    store.schema[props.branch].trunks.includes(cognate),
  );

  const neighbours = cognatePartial.filter(
    (cognate) =>
      store.schema[cognate] &&
      cognatePartial.some((p) => store.schema[cognate].trunks.includes(p)),
  );

  const laterals = [];

  return (
    <>
      <Show
        when={isValue()}
        fallback={
          <a
            className={`${props.branch}-branch`}
            onClick={() => setIsValue(true)}
            style={{ borderBottom: "thin solid" }}
          >
            {props.branch}{" "}
          </a>
        }
      >
        <a
          className={`${props.branch}-value`}
          onClick={() => setIsValue(false)}
          style={{ borderBottom: "thin solid" }}
        >
          {props.value}{" "}
        </a>
      </Show>

      <Spoiler index={`${props.index}-to`} title={"to"}>
        <Show when={laterals.length > 0} fallback={<></>}>
          <span>lateral </span>

          <For each={laterals}>
            {(cognate, index) => (
              <a key={index()} onClick={() => leapfrog(cognate)}>
                {cognate}{" "}
              </a>
            )}
          </For>
        </Show>

        <Show when={recurses.length > 0} fallback={<></>}>
          <span>deep </span>

          <For each={recurses}>
            {(recurse, index) => (
              <a key={index()} onClick={() => backflip(recurse)}>
                {recurse}{" "}
              </a>
            )}
          </For>
        </Show>

        <Show when={neighbours.length > 0} fallback={<></>}>
          <span>side </span>

          <For each={neighbours}>
            {(neighbour, index) => (
              <a key={index()} onClick={() => warp(neighbour)}>
                {neighbour}
              </a>
            )}
          </For>
        </Show>
      </Spoiler>
    </>
  );
}
