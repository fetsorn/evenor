import { describe, expect, test, afterEach, vi } from "vitest";
import {
  store,
  updateSearchParams,
  setStore,
  getSortedRecords,
  getFilterQueries,
  getFilterOptions,
  onRecordEdit,
  onRecordCreate,
  onRecordSave,
  onRecordWipe,
  onSearch,
  onMindChange,
  appendRecord,
  getSpoilerOpen,
  setSpoilerOpen,
} from "@/store/store.js";
import { changeSearchParams, makeURL } from "@/store/pure.js";
import { createRecord, selectStream } from "@/store/impure.js";
import { saveRecord, wipeRecord, changeMind } from "@/store/action.js";
import schemaRoot from "@/store/default_root_schema.json";

vi.mock("@/store/action.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    saveRecord: vi.fn(),
    wipeRecord: vi.fn(),
    changeMind: vi.fn(),
  };
});

vi.mock("@/store/impure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    createRecord: vi.fn(),
    selectStream: vi.fn(),
  };
});

vi.mock("@/store/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    changeSearchParams: vi.fn(),
    makeURL: vi.fn(),
  };
});

describe("store", () => {
  // restore after, not before
  // to keep initial state
  afterEach(() => {
    setStore(undefined);

    changeSearchParams.mockReset();
    makeURL.mockReset();
    createRecord.mockReset();
    selectStream.mockReset();
    saveRecord.mockReset();
    wipeRecord.mockReset();
    changeMind.mockReset();

    setStore({
      abortPreviousStream: () => {},
      searchParams: new URLSearchParams("_=mind"),
      mind: { _: "mind", mind: "root", name: "minds" },
      schema: schemaRoot,
      record: undefined,
      records: [],
    });
  });

  describe("onRecordEdit", () => {
    test("", async () => {
      await onRecordEdit(["record"], 1);

      expect(store.record).toStrictEqual(1);
    });
  });

  describe("onRecordCreate", () => {
    test("", async () => {
      createRecord.mockImplementation(() => 1);

      await onRecordCreate();

      expect(createRecord).toHaveBeenCalledWith("root", "mind");

      expect(store.record).toStrictEqual(1);
    });
  });

  describe("onRecordSave", () => {
    test("", async () => {
      saveRecord.mockImplementation(() => 1);

      await onRecordSave({}, {});

      expect(saveRecord).toHaveBeenCalledWith("root", "mind", [], {}, {});

      expect(store.records).toStrictEqual(1);
    });
  });

  describe("onRecordWipe", () => {
    test("", async () => {
      wipeRecord.mockImplementation(() => 1);

      await onRecordWipe({});

      expect(wipeRecord).toHaveBeenCalledWith("root", "mind", [], {});

      expect(store.records).toStrictEqual(1);
    });
  });

  describe("appendRecord", () => {
    test("", async () => {
      appendRecord({});

      expect(store.records).toStrictEqual([{}]);
    });
  });

  describe("updateSearchParams", () => {
    test("searches", async () => {
      const field = "a";

      const value = "b";

      changeSearchParams.mockImplementation(() => "1");

      window.history.replaceState = vi.fn();

      makeURL.mockImplementation(() => 2);

      await updateSearchParams(field, value);

      expect(store.searchParams.toString()).toStrictEqual("1");

      expect(window.history.replaceState).toHaveBeenCalledWith(null, null, 2);
    });

    test("ignores evenor specific param", async () => {
      const field = ".a";

      const value = "b";

      changeSearchParams.mockImplementation(() => "1");

      window.history.replaceState = vi.fn();

      makeURL.mockImplementation(() => 2);

      await updateSearchParams(field, value);

      expect(store.searchParams).toBe("1");

      // TODO actually check that it ignores
    });
  });

  describe("onSearch", () => {
    test("searches", async () => {
      const startStream = vi.fn();

      selectStream.mockImplementation(() => ({
        abortPreviousStream: () => 3,
        startStream,
      }));

      await onSearch();

      expect(store.records).toStrictEqual([]);

      expect(startStream).toHaveBeenCalled();

      expect(selectStream).toHaveBeenCalled();

      expect(store.abortPreviousStream()()).toBe(3);
    });
  });

  describe("onMindChange", () => {
    test("", async () => {
      const mind = { _: "mind", mind: "id", name: "name" };

      changeMind.mockImplementation(async () => ({
        mind: mind,
        schema: 2,
        searchParams: 3,
      }));

      window.history.replaceState = vi.fn();

      makeURL.mockImplementation(() => 5);

      await onMindChange("/", "_=mind");

      expect(store.mind).toStrictEqual(mind);

      expect(store.schema).toStrictEqual(2);

      expect(store.searchParams).toStrictEqual("3");
    });
  });

  describe("getSpoilerOpen", () => {
    test("undefined at first", async () => {
      expect(getSpoilerOpen("a")).toBe(undefined);
    });

    test("gets true", async () => {
      setStore("spoilerMap", "a", true);

      expect(getSpoilerOpen("a")).toBe(true);
    });
  });

  describe("setSpoilerOpen", () => {
    test("sets true", async () => {
      setStore("spoilerMap", "a", false);

      setSpoilerOpen("a", true);

      expect(store.spoilerMap["a"]).toBe(true);
    });
  });

  describe("getSortedRecords", () => {
    test("sorts descending", async () => {
      const record1 = { _: "mind", mind: "id1" };

      const record2 = { _: "mind", mind: "id2" };

      setStore("records", [record1, record2]);

      setStore(
        "searchParams",
        new URLSearchParams(".sortBy=mind&.sortDirection=first"),
      );

      expect(getSortedRecords()).toStrictEqual([record1, record2]);
    });

    test("sorts ascending", async () => {
      const record1 = { _: "mind", mind: "id1" };

      const record2 = { _: "mind", mind: "id2" };

      setStore("records", [record1, record2]);

      setStore(
        "searchParams",
        new URLSearchParams(".sortBy=mind&.sortDirection=last"),
      );

      expect(getSortedRecords()).toStrictEqual([record2, record1]);
    });
  });

  describe("getFilterQueries", () => {
    test("", async () => {
      expect(getFilterQueries()).toStrictEqual([["_", "mind"]]);
    });
  });

  describe("getFilterOptions", () => {
    test("", async () => {
      expect(getFilterOptions()).toStrictEqual([
        "name",
        "category",
        "branch",
        "local_tag",
        "origin_url",
        "sync_tag",
        "mind",
        "__",
      ]);
    });
  });
});
