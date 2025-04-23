import { describe, expect, test, afterEach, vi } from "vitest";
import {
  store,
  setStore,
  onRecordEdit,
  onRecordSave,
  onRecordWipe,
  onSearch,
  onRepoChange,
  appendRecord,
  getSpoilerOpen,
  setSpoilerOpen,
} from "@/store/store.js";
import {
  editRecord,
  saveRecord,
  wipeRecord,
  changeRepo,
  search,
} from "@/store/action.js";
import schemaRoot from "@/store/default_root_schema.json";

vi.mock("@/store/action.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    editRecord: vi.fn(),
    saveRecord: vi.fn(),
    wipeRecord: vi.fn(),
    changeRepo: vi.fn(),
    search: vi.fn(),
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
      editRecord.mockImplementation(() => 1);

      await onRecordEdit({});

      expect(editRecord).toHaveBeenCalledWith("root", "repo", {});

      expect(store.record).toEqual(1);
    });
  });

  describe("onRecordSave", () => {
    test("", async () => {
      saveRecord.mockImplementation(() => 1);

      await onRecordSave({}, {});

      expect(saveRecord).toHaveBeenCalledWith("root", "repo", [], {}, {});

      expect(store.records).toEqual(1);
    });
  });

  describe("onRecordWipe", () => {
    test("", async () => {
      wipeRecord.mockImplementation(() => 1);

      await onRecordWipe({});

      expect(wipeRecord).toHaveBeenCalledWith("root", "repo", [], {});

      expect(store.records).toEqual(1);
    });
  });

  describe("appendRecord", () => {
    test("", async () => {
      appendRecord({});

      expect(store.records).toEqual([{}]);
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

      expect(store.searchParams).toEqual(1);

      expect(store.records).toEqual([]);

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

      expect(store.repo).toEqual(repo);

      expect(store.schema).toEqual(2);

      expect(store.searchParams).toEqual(3);

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
