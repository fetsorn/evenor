import { useContext, createSignal } from "solid-js";
import { StoreContext } from "@/store/index.js";
import api from "@/api/index.js";
import { convert, isIFrameable } from "./asset_view_controller.js";

export function AssetView(props) {
  const { store } = useContext(StoreContext);

  const [blobURL, setBlobURL] = createSignal(undefined);

  const [mimetype, setMimetype] = createSignal("");

  const branch = props.record._;

  const filehashBranch = Object.keys(schema).find(
    (b) =>
      (schema[b].trunks.includes(branch) || b === branch) &&
      schema[b].task === "filehash",
  );

  const fileextBranch = Object.keys(schema).find(
    (b) => schema[b].trunks.includes(branch) && schema[b].task === "fileext",
  );

  const filenameBranch = Object.keys(schema).find(
    // when file is object, filename is a leaf
    // when file is a string, it is also a filename
    (b) =>
      (schema[b].trunks.includes(branch) || b === branch) &&
      schema[b].task === "filename",
  );

  const filenameFull = `${props.record[filehashBranch]}.${props.record[fileextBranch]}`;

  async function fetchAsset() {
    let contents;

    try {
      contents = await api.fetchAsset(store.repo.repo, filenameFull);
    } catch (e) {
      console.log(e);
    }

    if (contents === undefined) {
      console.log("assetView failed", props.record);

      return;
    }

    return contents;
  }

  async function onView() {
    let contents = await fetchAsset();

    // if cannot be shown in the browser, try to convert to something that can be shown
    if (!isIFrameable(filenameFull)) {
      contents = await convert(props.record[filehashBranch], contents);
    }

    const mime = await import("mime");

    const mimetypeNew = mime.getType(filenameFull);

    setMimetype(mimetypeNew);

    const blob = new Blob([contents], { type: mimetypeNew });

    const blobURLNew = URL.createObjectURL(blob);

    setBlobURL(blobURLNew);
  }

  async function onDownload() {
    let contents = await fetchAsset();

    api.downloadAsset(new Blob([contents]), filenameFull);
  }

  <Show
    when={blobURL() !== undefined}
    fallback={
      <Show when={props.record[filehashBranch] || filenameFull}>
        <span>
          <span>{props.record[filehashBranch]}</span>

          <span>{filenameFull}</span>

          <button type="button" onClick={() => onView()}>
            ▶️
          </button>

          <button type="button" onClick={() => onDownload()}>
            ⬇️
          </button>
        </span>
      </Show>
    }
  >
    <span>
      <span>
        <span>{props.record[filehashBranch]}</span>

        <span>{filenameFull}</span>

        <button type="button" onClick={() => setBlobURL(undefined)}>
          🔽
        </button>

        <button type="button" onClick={() => onDownload()}>
          ⬇️
        </button>
      </span>

      <Switch
        fallback={
          <object aria-label="file view" type={mimetype()} data={downloadUrl} />
        }
      >
        <Match when={mimetype().includes("image")}>
          <img alt="file view" width="100%" src={blobURL()} type={mimetype()} />
        </Match>
        <Match when={mimetype().includes("audio")}>
          <audio controls>
            <track kind="captions" />
            <source src={blobURL()} type={mimetype()} />
          </audio>
        </Match>
        <Match when={mimetype().includes("video")}>
          <video width="100%" controls>
            <track kind="captions" />
            <source src={blobURL()} type={mimetype()} />
          </video>
        </Match>
        <Match when={mimetype().includes("pdf")}>
          <iframe
            title={blobURL()}
            width="100%"
            height="1000"
            src={blobURl()}
          />
        </Match>
      </Switch>
    </span>
  </Show>;
}
