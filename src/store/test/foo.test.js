import { describe, expect, test, vi } from "vitest";
import {
  addLeafValue,
  onFieldRemove,
  onFieldChange,
  onFieldItemChange,
  onFieldItemRemove,
} from "@/store/foo.js";
import { onRecordEdit } from "@/store/store.js";
import schemaRoot from "@/store/default_root_schema.json";

vi.mock("@/store/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn(),
  };
});

describe("addLeafValue", () => {
  test("", () => {
    const schema = schemaRoot;

    const leaf = "branch";

    const record = { _: "branch", branch: "a" };

    addLeafValue(schema, leaf, record, onRecordEdit);

    expect(onRecordEdit).toHaveBeenCalledWith({
      _: "branch",
      branch: [
        "a",
        {
          _: "branch",
          branch: "",
        },
      ],
    });
  });
});

describe("onFieldRemove", () => {
  test("", () => {
    const field = "branch";

    const record = { _: "branch", branch: "a" };

    onFieldRemove(field, record, onRecordEdit);

    expect(onRecordEdit).toHaveBeenCalledWith({
      _: "branch",
    });
  });
});

describe("onFieldChange", () => {
  test("", () => {
    const field = "branch";

    const value = "b";

    const record = { _: "branch", branch: "a" };

    onFieldChange(field, value, record, onRecordEdit);

    expect(onRecordEdit).toHaveBeenCalledWith({
      _: "branch",
      branch: "b",
    });
  });
});

describe("onFieldItemChange", () => {
  test("adds element", () => {
    const index = 1;

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const branch = "branch";

    const foo = vi.fn();

    onFieldItemChange(index, item, items, branch, foo);

    expect(foo).toHaveBeenCalledWith("branch", [item, item]);
  });

  test("changes item", () => {
    const index = 0;

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const branch = "branch";

    const foo = vi.fn();

    const itemNew = { _: "branch", branch: "b" };

    onFieldItemChange(index, itemNew, items, branch, foo);

    expect(foo).toHaveBeenCalledWith("branch", [itemNew]);
  });
});

describe("onFieldItemRemove", () => {
  test("removes", () => {
    const index = 0;

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const branch = "branch";

    const change = vi.fn();

    const remove = vi.fn();

    onFieldItemRemove(index, items, branch, change, remove);

    expect(remove).toHaveBeenCalledWith(branch);
  });

  test("changes", () => {
    const index = 0;

    const item = { _: "branch", branch: "a" };

    const items = [item, item];

    const branch = "branch";

    const change = vi.fn();

    const remove = vi.fn();

    onFieldItemRemove(index, items, branch, change, remove);

    expect(change).toHaveBeenCalledWith(branch, [item]);
  });
});

describe("chain", () => {
  test("field", () => {
    const record = { _: "branch", branch: "a" };

    const field = "branch";

    const value = "b";

    onFieldChange(field, value, record, onRecordEdit);

    expect(onRecordEdit).toHaveBeenCalledWith({
      _: "branch",
      branch: [
        "a",
        {
          _: "branch",
          branch: "",
        },
      ],
    });
  });

  test("field item", () => {
    const index = 1;

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const branch = "branch";

    const record = { _: "branch", branch: "a" };

    onFieldItemChange(index, item, items, branch, (field, value) =>
      onFieldChange(field, value, record, onRecordEdit),
    );

    expect(onRecordEdit).toHaveBeenCalledWith({
      _: "branch",
      branch: [
        {
          _: "branch",
          branch: "a",
        },
        {
          _: "branch",
          branch: "a",
        },
      ],
    });
  });

  test("record", () => {
    const schema = schemaRoot;

    const leaf = "branch";

    const index = 1;

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const branch = "branch";

    const record = { _: "branch", branch: "a" };

    addLeafValue(schema, leaf, record, (r) =>
      onFieldItemChange(index, r, items, branch, (field, value) =>
        onFieldChange(field, value, record, onRecordEdit),
      ),
    );
    expect(onRecordEdit).toHaveBeenCalledWith({
      _: "branch",
      branch: [
        {
          _: "branch",
          branch: "a",
        },
        {
          _: "branch",
          branch: [
            "a",
            {
              _: "branch",
              branch: "",
            },
          ],
        },
      ],
    });
  });
});
