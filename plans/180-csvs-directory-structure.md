# Plan: Issue #180 — Change directory structure to csvs/

## Summary

Switch from bare layout (CSV files at repo root) to nested layout (CSV files under `csvs/` subdirectory). This means changing `bare: true` to the default `bare: false` across the JS API and updating the Rust backend to use `Dataset::create` consistently with `bare: false`.

### Before (bare layout)
```
mind-dir/
  .git/
  .csvs.csv
  .gitignore
  _-_.csv
  branch-foo.csv
  event-bar.csv
```

### After (nested layout)
```
mind-dir/
  .git/
  .gitignore
  csvs/
    .csvs.csv
    _-_.csv
    branch-foo.csv
    event-bar.csv
```

## Design decisions (from user)
- **Clean break**: No backward compatibility or auto-migration for existing bare minds
- **JS API**: Remove `bare: true` params (let csvs-js default to `bare: false`)
- **Rust backend**: Use `Dataset::create(&mind_dir, false)` for all minds (root and non-root)
- **Fixtures**: Restructure test fixtures to have CSV files under `csvs/` subdirectory

---

## Steps

### 1. Browser JS API — remove `bare: true` from all csvs calls

**File: `src/api/browser/csvs.js`**
- Remove `bare: true` from `selectRecord` call (line 22)
- Remove `bare: true` from `buildRecord` call (line 31)
- Remove `bare: true` from `selectRecordStreamPull` call (line 52)
- Remove `bare: true` from `updateRecord` call (line 85)
- Remove `bare: true` from `deleteRecord` call (line 103)

### 2. Browser JS API — update `init` to use non-bare csvs.init

**File: `src/api/browser/git.js`**
- Line 47: Change `await csvs.init({ fs, dir, bare: true })` to `await csvs.init({ fs, dir })`
- The csvs-js `init` function with `bare: false` (default) will create `csvs/` subdirectory and `.csvs.csv` inside it
- Remove the manual `.csvs.csv` write if csvs.init handles it (it does for bare:false — it creates the `csvs/` dir and `.csvs.csv` inside)

### 3. Rust backend — update `make_mind` for non-root minds

**File: `src-tauri/src/mind/make_mind.rs`**
- In the `None` branch (new mind creation, ~line 57-72):
  - Replace the manual `.csvs.csv` write with `Dataset::create(&mind_dir, false).await?`
  - Remove lines 67-69 (manual csvscsv_path creation and write)
  - Add `Dataset::create(&mind_dir, false).await?` after the gitignore write
- The root mind branch (line 40) already calls `Dataset::create(&mind_dir, false)` — no change needed

### 4. Update test fixtures — restructure repo fixtures to nested layout

**Directory: `src/test/fixtures/repo/test-mind1/` and `test-mind2/`**
- Create `csvs/` subdirectory in each
- Move all CSV files (`.csvs.csv`, `_-_.csv`, `branch-*.csv`, `event-*.csv`) into `csvs/`
- Keep `.git/`, `.gitignore`, `.gitattributes` at repo root
- The git history will need to be regenerated/updated to reflect the new paths (or the fixtures can be recreated)

### 5. Update browser unit tests

**File: `src/api/browser/test/git.test.js`**
- Update assertions that check for `.csvs.csv` at repo root to check for `csvs/.csvs.csv` instead:
  - Line 103: `${stub.dirpath}/.csvs.csv` → `${stub.dirpath}/csvs/.csvs.csv`
  - Line 128: `/root/.csvs.csv` → `/root/csvs/.csvs.csv`
  - Line 232: `filepath: ".csvs.csv"` → references to csvs subdirectory paths
  - Line 243: commit message assertion may need updating depending on what files are staged

**File: `src/api/browser/test/csvs.test.js`**
- The mock functions don't check `bare` so these should work without changes, but verify after removing `bare: true`

### 6. Update Rust unit tests

**File: `src-tauri/src/mind/make_mind.rs` (test module, lines 78-182)**
- The tests check directory structure after `make_mind` — they should still pass since they check for `store/root` and `store/emind-etest` directory names, not internal CSV layout
- Verify tests still pass after the `Dataset::create` change

### 7. Verify and run tests

- Run `yarn test` to verify browser unit tests pass
- Run `cargo test` in `src-tauri/` to verify Rust tests pass
- Manually verify that `csvs.init` with `bare: false` creates the expected `csvs/` subdirectory structure in LightningFS

## Files changed

| File | Change |
|------|--------|
| `src/api/browser/csvs.js` | Remove all `bare: true` params |
| `src/api/browser/git.js` | Remove `bare: true` from `csvs.init` call |
| `src-tauri/src/mind/make_mind.rs` | Use `Dataset::create` for non-root minds |
| `src/api/browser/test/git.test.js` | Update `.csvs.csv` path assertions to `csvs/.csvs.csv` |
| `src/test/fixtures/repo/test-mind1/` | Move CSV files into `csvs/` subdir |
| `src/test/fixtures/repo/test-mind2/` | Move CSV files into `csvs/` subdir |

## Risks

- **Test fixtures with git history**: The `.git` objects in fixtures reference file paths. Moving CSV files means the git history won't match the working tree. May need to regenerate fixtures or just recreate them from scratch.
- **csvs-rs Dataset::open**: Currently called as `Dataset::open(&mind_dir)` in `db.rs`. Need to verify that `Dataset::open` auto-detects the nested layout (looks for `csvs/` subdir). If it doesn't, may need to pass a `bare: false` flag.
