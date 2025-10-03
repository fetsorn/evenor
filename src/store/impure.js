import api from "@/api/index.js";
import { searchParamsToQuery } from "@/store/pure.js";
import {
  newUUID,
  updateMind,
  updateEntry,
  saveMindRecord,
  loadMindRecord,
} from "@/store/record.js";
import defaultMindRecord from "@/store/default_mind_record.json";

/**
 * This
 * @name updateRecord
 * @function
 * @param {object} mind -
 * @param {String} base -
 * @param {object} recordNew -
 */
export async function updateRecord(mind, base, recordNew) {
  const isHomeScreen = mind === "root";

  const isMindBranch = base === "mind";

  const canSaveMind = isHomeScreen && isMindBranch;

  if (canSaveMind) {
    await updateMind(recordNew);

    await saveMindRecord(recordNew);
  } else {
    await updateEntry(mind, recordNew);
  }
}

/**
 * This
 * @name createRecord
 * @function
 * @param {object} mind -
 * @param {String} base -
 * @returns {object}
 */
export async function createRecord(mind, base) {
  const isHomeScreen = mind === "root";

  const isMindBranch = base === "mind";

  const isMindRecord = isHomeScreen && isMindBranch;

  const mindPartial = isMindRecord ? defaultMindRecord : {};

  const record = {
    _: base,
    [base]: await newUUID(),
    ...mindPartial,
  };

  return record;
}

/**
 * This
 * @name selectStream
 * @function
 * @param {object} schema -
 * @param {object} mind -
 * @param {Function} appendRecord -
 * @param {SearchParams} searchParams -
 * @returns {object}
 */
export async function selectStream(schema, mind, appendRecord, searchParams) {
  // prepare a controller to stop the new stream
  let isAborted = false;

  const abortController = new AbortController();

  function abortPreviousStream() {
    isAborted = true;

    abortController.abort();
  }

  // remove all evenor-specific searchParams before passing to csvs
  const searchParamsWithoutCustom = new URLSearchParams(
    Array.from(searchParams.entries()).filter(([key]) => !key.startsWith(".")),
  );

  const query = searchParamsToQuery(schema, searchParamsWithoutCustom);

  // prepare a new stream
  const { strm: fromStrm, closeHandler } = await api.selectStream(mind, query);

  const isHomeScreen = mind === "root";

  // create a stream that appends to records
  const toStrm = new WritableStream({
    async write(chunk) {
      if (isAborted) {
        return;
      }

      // when selecting a mind, load git state and schema from folder into the record
      const record = isHomeScreen ? await loadMindRecord(chunk) : chunk;

      appendRecord(record);
    },

    abort() {
      // stream interrupted
      // no need to await on the promise, closing api stream for cleanup
      closeHandler();
    },
  });

  async function startStream() {
    return fromStrm.pipeTo(toStrm, { signal: abortController.signal });
  }

  return { abortPreviousStream, startStream };
}

/**
 * This
 * @name onMergeMind
 * @function
 * @param {object} schema -
 * @param {object} mind -
 * @param {String} name -
 * @param {String} searchString -
 */
export async function onMergeMind(schema, mind, name, searchString) {
  const query = { _: "name", name };

  const [{ mind: subsetMind }] = await api.select("root", query);

  const subsetQuery = searchParamsToQuery(
    schema,
    new URLSearchParams(searchString),
  );

  // find entries to sync from subset
  const entries = await api.select(subsetMind, subsetQuery);

  // sync entries to superset
  for (const record of entries) {
    await api.updateRecord(mind, record);
  }

  await api.commit(mind);
}

/**
 * This
 * @name learn
 * @function
 * @param {object} source -
 * @param {object} query -
 * @param {object} target -
 * @returns {undefined}
 */
export async function learn(source, query, target) {
  // do not call api from layout, only call store
  const { strm: fromStrm, closeHandler } = await api.learn(
    source,
    query,
    target,
  );

  // TODO track progress
  const toStrm = new WritableStream({
    async write() {},
  });

  await fromStrm.pipeTo(toStrm);

  await api.commit(target);

  return undefined;
}
