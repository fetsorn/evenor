import { createSignal, useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { Spoiler } from "@/layout/components/index.js";

export function OverviewValue(props) {
  const { store } = useContext(StoreContext);

  const [isValue, setIsValue] = createSignal(true);

  // TODO: add schema[base].cognate from branch-cognate.csv
  const basePartial =
    props.branch === new URLSearchParams(store.searchParams).get("_")
      ? []
      : [props.branch];

  //const foo = store.schema[props.branch].trunks.some((t) =>
  //  store.schema[cognate].trunks.includes(t),
  //);

  // empty object if no branch in schema
  const branchObject = store.schema[props.branch] ?? {};

  const cognatePartial = (branchObject.cognates ?? []).concat(basePartial);

  const recurses = cognatePartial.filter((cognate) =>
    (branchObject.trunks ?? []).includes(cognate),
  );

  const neighbours = cognatePartial.filter(
    (cognate) =>
      store.schema[cognate] &&
      cognatePartial.some((p) => store.schema[cognate].trunks.includes(p)),
  );

  const laterals = [];

  const valueEscaped = props.value.replace("\\n", "\n");

  return (
    <>
      <Show
        when={isValue()}
        fallback={
          <button
            className={`${props.branch}-branch`}
            onClick={() => setIsValue(true)}
            style={{ borderBottom: "thin solid" }}
          >
            {props.branch}{" "}
          </button>
        }
      >
        <button
          className={`${props.branch}-value`}
          onClick={() => setIsValue(false)}
          style={{ borderBottom: "thin solid" }}
        >
          {valueEscaped} {/* TODO remove this unescape after csvs if fixed */}
        </button>
      </Show>

      <Show
        when={
          laterals.length > 0 || recurses.length > 0 || neighbours.length > 0
        }
        fallback={<></>}
      >
        <Spoiler index={`${props.index}-to`} title={"to"}>
          <Show when={laterals.length > 0} fallback={<></>}>
            <span>lateral </span>

            <For each={laterals}>
              {(cognate, index) => (
                <button key={index()} onClick={() => leapfrog(cognate)}>
                  {cognate}{" "}
                </button>
              )}
            </For>
          </Show>

          <Show when={recurses.length > 0} fallback={<></>}>
            <span>deep </span>

            <For each={recurses}>
              {(recurse, index) => (
                <button key={index()} onClick={() => backflip(recurse)}>
                  {recurse}{" "}
                </button>
              )}
            </For>
          </Show>

          <Show when={neighbours.length > 0} fallback={<></>}>
            <span>side </span>

            <For each={neighbours}>
              {(neighbour, index) => (
                <button key={index()} onClick={() => warp(neighbour)}>
                  {neighbour}
                </button>
              )}
            </For>
          </Show>
        </Spoiler>
      </Show>
    </>
  );
}
