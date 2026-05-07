import { invoke } from "@tauri-apps/api/core";

let nextStreamId = 0;

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

export default {
  sparql,
};
