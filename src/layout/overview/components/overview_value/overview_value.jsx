import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";

export function OverviewValue(props) {
  const { store } = useContext(StoreContext);

  // TODO: add schema[base].cognate from branch-cognate.csv
  const basePartial =
    props.branch === store.searchParams.get("_") ? [] : [props.branch];

  const cognatePartial = store.schema[props.branch].cognate
    ? [store.schema[props.branch].cognate].flat()
    : [];

  const laterals = cognatePartial
    .filter((cognate) => {
      return (
        store.schema[cognate] &&
        store.schema[props.branch].trunks.some((t) =>
          store.schema[cognate].trunks.includes(t),
        )
      );
    })
    .concat(basePartial);

  const recurses = cognatePartial.filter((cognate) =>
    store.schema[props.branch].trunks.includes(cognate),
  );

  const neighbours = cognatePartial.filter(
    (cognate) =>
      store.schema[cognate] &&
      cognatePartial.some((p) => store.schema[cognate].trunks.includes(p)),
  );

  // lateral jump
  async function leapfrog(cognate) {
    await setQuery(undefined, undefined);

    await setQuery("_", store.searchParams.get("_"));

    await setQuery("__", cognate);

    await setQuery(props.branch, value);
  }

  // deep jump
  async function backflip(cognate) {
    await setQuery(undefined, undefined);

    await setQuery("_", cognate);

    await setQuery("__", props.branch);

    await setQuery(cognate, value);
  }

  async function sidestep(cognate) {
    await setQuery(undefined, undefined);

    await setQuery("_", cognate);

    await setQuery(cognate, value);
  }

  // side jump
  async function warp(cognate) {
    await setQuery(undefined, undefined);

    await setQuery("_", store.schema[cognate].trunks[0]);

    await setQuery("__", cognate);

    await setQuery(store.schema[cognate].trunks[0], value);
  }

  return (
    <span>
      <span style={{ borderBottom: "thin solid" }}>{props.value}</span>

      <span> </span>

      {/* lateral jump */}
      <Show when={laterals.length > 0} fallback={<></>}>
        <span>
          To<span> </span>
          <For each={laterals}>
            {(cognate, index) => (
              <a key={index()} onClick={() => leapfrog(cognate)}>
                {cognate}
              </a>
            )}
          </For>
          <span> </span>
        </span>
      </Show>

      {/* deep jump */}
      <Show when={recurses.length > 0} fallback={<></>}>
        <span>
          To<span> </span>
          <For each={recurses}>
            {(recurse, index) => (
              <a key={index()} onClick={() => backflip(recurse)}>
                {recurse}
              </a>
            )}
          </For>
          <span> </span>
        </span>
      </Show>

      {/* side jump */}
      <Show when={neighbours.length > 0} fallback={<></>}>
        <span>
          To<span> </span>
          <For each={neighbours}>
            {(neighbour, index) => (
              <a key={index()} onClick={() => warp(neighbour)}>
                {neighbour}
              </a>
            )}
          </For>
          <span> </span>
        </span>
      </Show>
    </span>
  );
}
