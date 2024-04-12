import React from "react";
import { useStore } from "../../../../store/index.js";
import { Dropdown } from "../../../../components/index.js";
import { findCrown, isTwig } from "@fetsorn/csvs-js";

export function EditPlus() {
  const [schema, base, record, onRecordUpdate] = useStore(
    (state) => [
      state.schema,
      state.base,
      state.record,
      state.onRecordUpdate
    ],
  );

  // find all branches that connect to base
  const crown = findCrown(schema, base);

  // TODO for each branch starting with base
  // for each value of branch
  // list a new value and
  // for each leaf of branch
  // call this again
  const strategies = crown.reduce((acc, branch) => {
    const { trunk } = schema[branch];

    const valuesOld = [];

    const trunkValue = "";

    const strategy = `${trunk}-${trunkValue}-${branch}`

    return {...acc, [strategy]: { trunk, trunkValue, branch }}
  }, {});

  function onBranchAdd(recordOld, trunkValue, branch) {
    console.log("add", branch);

    const recordNew = recordOld;

    // if twig add empty value
    // if trunk add empty object
    // const branchValue = isTwig(schema, branch)
    //       ? ""
    //       : {};

    // const { trunk } = schema[branch];

    // if (trunk === base) {
    //   const valuesOld = recordOld[branch];

    //   if (valuesOld === undefined) {

    //   }
    // } else {

    // }

    // get old values

    // if adding record to field
    // if list empty, initialize list
    // add item to list
    // if adding field to record
    // if record empty, initialize record

    return recordNew
  }


  // TODO: add css for lower right
  return (
    <select
      value="default"
      onChange={({ target: { value: strategy } }) => onRecordUpdate(onBranchAdd(strategy))}
    >
      <option hidden disabled value="default">
       +
      </option>

      {Object.keys(strategies).map((branch) => (
        <option key={branch} value={branch}>
          {branch}
        </option>
      ))}
    </select>
  )
}
