import { useContext } from "solid-js";
import { StoreContext, onSearch } from "@/store/index.js";
import { Spoiler } from "@/layout/components/index.js";
import { ContentEditable } from "@bigmistqke/solid-contenteditable";
import styles from "./overview_filter.module.css";

export function OverviewFilter() {
  const { store } = useContext(StoreContext);

  const canDelete = (field) => field !== ".sortBy" && field !== "_";

  // find all fields name
  const leafFields = () =>
    store.schema[store.queries._].leaves.concat([store.queries._, "__"]);

  // find field name which added to filterqueries
  const addedFields = () => Object.keys(store.queries);

  // find name fields which is not added to filterqueries
  const notAddedFields = () =>
    leafFields().filter((key) => !addedFields().includes(key));

  const queries = () =>
    Object.entries(store.queries).filter(
      ([key, value]) => key !== ".sortDirection",
    );

  // TODO base and sortby as spoiler options.

  // use Index here to retain focus on contenteditable when editing
  // because For considers an item deleted on every input and rerenders
  // and Index only rerenders when an index is deleted or added
  return (
    <span className={styles.filter}>
      <Index each={queries()}>
        {(item, index) => {
          // item of Index is a signal
          const [field, value] = item();

          return (
            <span>
              {field}:{" "}
              <ContentEditable
                id={`filter-${field}`}
                textContent={value}
                onTextContent={(content) => onSearch(field, content)}
                style={{ display: "inline-block", "min-width": "4rem" }}
              />
              <span> </span>
              <Show when={canDelete(field)} fallback={<></>}>
                <a onClick={() => onSearch(field, undefined)}>X </a>
              </Show>
            </span>
          );
        }}
      </Index>
      <span> </span>
      <Show
        when={store.queries[".sortDirection"] === "first"}
        fallback={
          <a onClick={() => onSearch(".sortDirection", "first")}>sort last</a>
        }
      >
        <a onClick={() => onSearch(".sortDirection", "last")}>sort first</a>
      </Show>
      <span> </span>
      <Spoiler index="add" title="more" fallback={<></>}>
        <For each={notAddedFields()} fallback={<></>}>
          {(field, index) => (
            <a onClick={() => onSearch(field, "")}>
              {field}
              <span> </span>
            </a>
          )}
        </For>
      </Spoiler>
      <span> </span>
      <span>found {store.records.length}</span>
      <span> </span>
      <a onClick={() => window.scrollTo(0, 0)}>scroll to top</a>
    </span>
  );
}
