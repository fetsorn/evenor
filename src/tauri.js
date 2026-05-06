import { invoke, Channel } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";

async function sparql({ kind, graph, query }) {
  // TODO accept sparql string and infer kind with haydee
  // const { kind, graph, inner } = await haydee.classify(sparql);

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await invoke("sparql", {
        kind,
        graph,
        query,
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
