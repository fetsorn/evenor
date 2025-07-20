import { describe, expect, test, afterEach, vi } from "vitest";
import {
  store,
  setStore,
  getSortedRecords,
  getFilterQueries,
  getFilterOptions,
  onRecordEdit,
  onRecordCreate,
  onRecordSave,
  onRecordWipe,
  onSearch,
  onRepoChange,
  appendRecord,
  getSpoilerOpen,
  setSpoilerOpen,
} from "@/store/store.js";
import { createRecord } from "@/store/impure.js";
import { saveRecord, wipeRecord, changeRepo, search } from "@/store/action.js";
import schemaRoot from "@/store/default_root_schema.json";

vi.mock("@/store/action.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    saveRecord: vi.fn(),
    wipeRecord: vi.fn(),
    changeRepo: vi.fn(),
    search: vi.fn(),
  };
});

vi.mock("@/store/impure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    createRecord: vi.fn(),
  };
});

describe("store", () => {
  // restore after, not before
  // to keep initial state
  afterEach(() => {
    setStore(undefined);

    setStore({
      abortPreviousStream: () => {},
      searchParams: new URLSearchParams("_=repo"),
      repo: { _: "repo", repo: "root" },
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

      expect(createRecord).toHaveBeenCalledWith("root", "repo");

      expect(store.record).toStrictEqual(1);
    });
  });

  describe("onRecordSave", () => {
    test("", async () => {
      saveRecord.mockImplementation(() => 1);

      await onRecordSave({}, {});

      expect(saveRecord).toHaveBeenCalledWith("root", "repo", [], {}, {});

      expect(store.records).toStrictEqual(1);
    });
  });

  describe("onRecordWipe", () => {
    test("", async () => {
      wipeRecord.mockImplementation(() => 1);

      await onRecordWipe({});

      expect(wipeRecord).toHaveBeenCalledWith("root", "repo", [], {});

      expect(store.records).toStrictEqual(1);
    });
  });

  describe("appendRecord", () => {
    test("", async () => {
      appendRecord({});

      expect(store.records).toStrictEqual([{}]);
    });
  });

  describe("onSearch", () => {
    test("", async () => {
      const field = "a";

      const value = "b";

      const abortPreviousStream = vi.fn();

      const startStream = vi.fn();

      search.mockImplementation(() => ({
        searchParams: 1,
        abortPreviousStream,
        startStream,
      }));

      await onSearch(field, value);

      expect(search).toHaveBeenCalledWith(
        schemaRoot,
        new URLSearchParams("_=repo"),
        "root",
        undefined,
        field,
        value,
        appendRecord,
      );

      expect(store.searchParams).toStrictEqual(1);

      expect(store.records).toStrictEqual([]);

      expect(startStream).toHaveBeenCalled();
    });
  });

  describe("onRepoChange", () => {
    test("", async () => {
      const repo = { _: "uuid", repo: "uuid", reponame: "reponame" };

      changeRepo.mockImplementation(async () => ({
        repo: repo,
        schema: 2,
        searchParams: 3,
      }));

      search.mockImplementation(() => ({
        searchParams: 3,
        abortPreviousStream: () => {},
        startStream: () => {},
      }));

      await onRepoChange("/", "_=repo");

      expect(store.repo).toStrictEqual(repo);

      expect(store.schema).toStrictEqual(2);

      expect(store.searchParams).toStrictEqual(3);

      expect(search).toHaveBeenCalledWith(
        2,
        3,
        "uuid",
        "reponame",
        "",
        undefined,
        appendRecord,
      );
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
      const record1 = { _: "repo", repo: "uuid1" };

      const record2 = { _: "repo", repo: "uuid2" };

      setStore("records", [record1, record2]);

      setStore(
        "searchParams",
        new URLSearchParams(".sortBy=repo&.sortDirection=first"),
      );

      expect(getSortedRecords()[0]).toStrictEqual(record1);
    });

    test("sorts ascending", async () => {
      const record1 = { _: "repo", repo: "uuid1" };

      const record2 = { _: "repo", repo: "uuid2" };

      setStore("records", [record1, record2]);

      setStore(
        "searchParams",
        new URLSearchParams(".sortBy=repo&.sortDirection=last"),
      );

      expect(getSortedRecords()[0]).toStrictEqual(record2);
    });
  });

  describe("getFilterQueries", () => {
    test("", async () => {
      expect(getFilterQueries()).toStrictEqual([["_", "repo"]]);
    });
  });

  describe("getFilterOptions", () => {
    test("", async () => {
      expect(getFilterOptions()).toStrictEqual([
        "reponame",
        "category",
        "branch",
        "local_tag",
        "origin_url",
        "sync_tag",
        "repo",
        "__",
      ]);
    });
  });
});
