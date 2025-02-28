import React from "react";
import { useStore } from "@/store/index.js";

export function ViewValue({ schema, index, description, base, value }) {
  const [record, setQuery] = useStore((state) => [
    state.record,
    state.setQuery,
  ]);

  const { _: recordBase } = record;

  const isRepo = recordBase !== "repo";

  // TODO: add schema[base].cognate from branch-cognate.csv
  const basePartial = base === recordBase ? [] : [base];

  const cognatePartial = schema[base].cognate
    ? [schema[base].cognate].flat()
    : [];

  const laterals = cognatePartial
    .filter((cognate) => {
      return (
        schema[cognate] &&
        schema[base].trunks.some((t) => schema[cognate].trunks.includes(t))
      );
    })
    .concat(basePartial);

  const recurses = cognatePartial.filter((cognate) =>
    schema[base].trunks.includes(cognate),
  );

  const neighbours = cognatePartial.filter(
    (cognate) =>
      schema[cognate] &&
      cognatePartial.some((p) => schema[cognate].trunks.includes(p)),
  );

  // lateral jump
  async function leapfrog(cognate) {
    await setQuery(undefined, undefined);

    await setQuery("_", recordBase);

    await setQuery("__", cognate);

    await setQuery(base, value);
  }

  // deep jump
  async function backflip(cognate) {
    await setQuery(undefined, undefined);

    await setQuery("_", cognate);

    await setQuery("__", base);

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

    await setQuery("_", schema[cognate].trunks[0]);

    await setQuery("__", cognate);

    await setQuery(schema[cognate].trunks[0], value);
  }

  return (
    <span>
      <span>{description} is</span>

      <span> </span>

      <span>{value}</span>

      <span> </span>

      {/* lateral jump */}
      {isRepo && laterals.length > 0 && (
        <span>
          To<span> </span>
          {laterals.reduce(
            (acc, cognate, index) => [
              ...acc,
              index !== 0 && index !== laterals.length && ", ",
              <a key={index} onClick={() => leapfrog(cognate)}>
                {cognate}
              </a>,
            ],
            [],
          )}
          <span> </span>
        </span>
      )}

      {/* deep jump */}
      {isRepo && recurses.length > 0 && (
        <span>
          To<span> </span>
          {recurses.reduce(
            (acc, recurse, index) => [
              ...acc,
              index !== 0 && index !== recurse.length && ", ",
              <a key={index} onClick={() => backflip(recurse)}>
                {recurse}
              </a>,
            ],
            [],
          )}
          <span> </span>
        </span>
      )}

      {/* side jump */}
      {isRepo && neighbours.length > 0 && (
        <span>
          To<span> </span>
          {neighbours.reduce(
            (acc, neighbour, index) => [
              ...acc,
              index !== 0 && index !== neighbour.length && ", ",
              <a key={index} onClick={() => warp(neighbour)}>
                {neighbour}
              </a>,
            ],
            [],
          )}
          <span> </span>
        </span>
      )}
    </span>
  );
}
