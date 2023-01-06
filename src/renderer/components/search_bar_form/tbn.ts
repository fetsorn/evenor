import { queryWorkerInit } from "../../workers";

async function queryOptions(selected: any) {
  const queryWorker = queryWorkerInit();

  try {
    const options = await queryWorker.queryOptions(selected);

    return options;
  } catch (e) {
    console.log(e);

    return [];
  }
}

export async function onUseEffect(selected: any, setOptions: any) {
  const options = await queryOptions(selected);

  setOptions(options);
}
