import { queryWorkerInit } from "../../workers";

async function buildItinerary(overview: any, groupByLabel: any) {
  const queryWorker = queryWorkerInit();

  const itinerary = await queryWorker.buildLine(overview, groupByLabel);

  return itinerary;
}

function getGroupByLabel(schema: any, groupBy: any) {
  const groupByLabel = schema[groupBy]["label"] ?? groupBy;

  return groupByLabel;
}

export async function onUseEffect(
  schema: any,
  groupBy: any,
  overview: any,
  setItinerary: any
) {
  const groupByLabel = getGroupByLabel(schema, groupBy);

  const itinerary = await buildItinerary(overview, groupByLabel);

  setItinerary(itinerary);
}
