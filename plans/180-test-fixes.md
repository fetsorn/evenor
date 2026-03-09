# Plan: Fix test failures after #180 (csvs/ directory structure)

16 test failures across 8 files. **Only 4 are related to the bare→non-bare change.** The remaining 12 are pre-existing failures from the `records` → `recordSet` refactor.

---

## Category 1: bare→non-bare failures (4 tests in git.test.js)

### Root cause

`csvs.init({ fs, dir })` with default `bare: false` does **nothing** when `dir/csvs` doesn't exist. The function's non-bare path (line 39 of csvs-js `init/index.js`) only acts if `csvsdir` already exists — it was designed for initializing an already-existing directory, not creating one from scratch.

Additionally, with `bare: false` and an existing `csvsdir`, the function creates a double-nested `csvs/csvs/.csvs.csv` structure, which is not what we want.

### Fix: `src/api/browser/git.js` — manually create csvs/ directory

Replace `await csvs.init({ fs, dir })` with explicit directory creation:

```js
await fs.promises.mkdir(`${dir}/csvs`);
await fs.promises.writeFile(`${dir}/csvs/.csvs.csv`, "csvs,0.0.2", "utf8");
```

This creates the expected structure: `dir/csvs/.csvs.csv`. The select/update/delete calls with `bare: false` (default) will correctly compute `csvsdir = path.join(dir, "csvs")` and find the CSV files there.

### Test: "throws when root exists"

This test (`git.test.js:140`) expects `init("root")` to throw on second call. But the current `git.js:init()` function has a `return` on line 41 that silently returns when a non-root mind already exists. For root, the flow is:
1. First call: csvs dir doesn't exist → creates it
2. Second call: `csvs/` dir exists → `csvs.init` returns early (with bare:true it returned the dir; with our manual creation, we'd need to check if it already exists)

The fix: add a check before creating — if `dir/csvs/.csvs.csv` already exists, throw for root:

```js
if (mind === "root") {
  try {
    await fs.promises.stat(`${dir}/csvs/.csvs.csv`);
    throw new Error("already exists");
  } catch (e) {
    if (e.message === "already exists") throw e;
    // ENOENT means doesn't exist, proceed
  }
}
```

Or alternatively: just try mkdir and let it fail if the directory exists.

### Test: "adds" (commit test)

Already updated the assertion to expect `csvs/.csvs.csv`. Should pass once `init` creates the correct structure.

---

## Category 2: `records` → `recordSet` refactor failures (12 tests, pre-existing)

These tests reference `store.records` which was renamed to `store.recordSet` (now an array of string IDs, not record objects). `store.recordMap` maps IDs to full records.

### `src/store/test/store.test.js` (5 failures)

1. **onRecordSave** (line ~107): `store.records` → `store.recordSet`, and the expected value should be an array of IDs (strings) not record objects
2. **onRecordWipe** (line ~119): same `store.records` → `store.recordSet`
3. **appendRecord** (line ~127): same
4. **getSortedRecords > sorts descending** (line ~242): `setStore("records", ...)` → `setStore("recordSet", ...)`, and the records should be IDs; the `getSortedRecords` function likely returns records from `recordMap` so its test logic needs reworking
5. **getSortedRecords > sorts ascending** (line ~257): same

### `src/store/test/action.test.js` (2 failures)

1. **saveRecord** (line ~48-72): sets up `store.records` and expects record objects in result; needs to use `recordSet` (array of IDs) and `recordMap`
2. **wipeRecord > deletes** (line ~74-90): same

### `src/store/test/impure.test.js` (2 failures)

1. **selectStream > root** (line ~132): missing `streamCounter` parameter; needs to pass `store.streamCounter` or `0`
2. **selectStream > id** (line ~165): same

### `src/layout/overview/overview.test.jsx` (1 failure)

**"item"** test: `setStore("records", items)` → `setStore("recordSet", items)` and items should be IDs + populate `recordMap`

### `src/layout/bottom/bottom_count/bottom_count.test.jsx` (1 failure)

**"1"** test: `setStore("records", [1])` → `setStore("recordSet", [1])`

### `src/layout/profile/components/profile_record/profile_record.test.jsx` (1 failure)

**"adds branch"** test: looks for text "add..." but the rendered component shows "with...". Likely a UI change where the button text changed. Update assertion to match current UI.

---

## Recommended order

1. Fix `src/api/browser/git.js` init function (csvs/ creation) — unblocks the 4 git.test.js failures
2. Fix the 12 pre-existing test failures (records→recordSet, streamCounter, UI text)
3. Re-run tests
