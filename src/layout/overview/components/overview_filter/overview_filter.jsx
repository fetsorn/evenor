import { useContext, createSignal } from "solid-js";
import { StoreContext, onSearch } from "@/store/index.js";
import { API } from "@/api/index.js";
import { Spoiler } from "@/layout/components/index.js";
import { ContentEditable } from "@bigmistqke/solid-contenteditable";

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

  const [options, setOptions] = createSignal([]);

  async function onFocusIn(event, branch) {
    const api = new API(store.repo.repo);

    const optionsNew = await api.select({ _: branch });

    const optionValues = optionsNew.map((record) => record[branch]);

    setOptions([...new Set(optionValues)]);

    var editable = event.target;

    // enter edit mode
    editable.classList.add("editing");

    // get text
    var text = editable.innerText;

    // create input
    var input = document.createElement("input");
    input.type = "text";
    input.className = "editable-mirror";
    input.setAttribute("list", "panel_list");
    input.value = text;

    editable.appendChild(input);

    input.focus();
  }

  function onFocusOut(event, branch) {
    if (event.target.matches(".editable-mirror")) {
      var input = event.target;
      var editable = input.closest("[contenteditable]");

      // leave edit mode
      editable.classList.remove("editing");

      // get text
      var text = input.value;

      // destroy input
      input.parentNode.removeChild(input);

      // apply value
      editable.innerText = text;
    }
  }

  // TODO base and sortby as spoiler options.

  // use Index here to retain focus on contenteditable when editing
  // because For considers an item deleted on every input and rerenders
  // and Index only rerenders when an index is deleted or added
  return (
    <span>
      <Index each={Object.entries(store.queries)}>
        {(item, index) => {
          // item of Index is a signal
          const [field, value] = item();

          return (
            <span>
              {field}:{" "}
              <ContentEditable
                id={`filter-${field}`}
                textContent={value}
                onFocusIn={(event) => onFocusIn(event, field)}
                onFocusOut={(event) => onFocusOut(event, field)}
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
      <datalist id={`panel_list`}>
        <For each={options()}>
          {(option, index) => (
            <option key={`panel_list ${option}`} value={option} />
          )}
        </For>
      </datalist>
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
    </span>
  );
}
