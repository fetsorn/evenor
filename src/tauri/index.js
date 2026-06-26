import { invoke } from "@tauri-apps/api/core";

let nextStreamId = 0;

async function archive(mind) {
  await invoke("archive", { mind });
}

async function restore(mind) {
  await invoke("restore", { mind });
}

async function sparql({ kind, graph, query }) {
  // TODO accept sparql string and infer kind with haydee
  // const { kind, graph, inner } = await haydee.classify(sparql);

  const streamId = String(nextStreamId++);

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await invoke("sparql", {
        kind,
        graph,
        query,
        streamId,
      });

      if (done) {
        controller.close();

        return;
      }

      controller.enqueue(value);
    },
  });
}

async function merge(mind, strategy) {
  await invoke("merge", { mind, strategy });
}

export default {
  sparql,
  archive,
  restore,
  merge,
};
