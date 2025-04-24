import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store, onRecordEdit } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { ProfileRecord } from "./profile_record.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn((path, value) => setStore(...path, value)),
  };
});

describe("ProfileRecord", () => {
  test("adds branch", async () => {
    const index = "index";

    const branch = "branch";

    const baseRecord = { _: "repo", repo: "uuid" };

    setStore("record", baseRecord);

    onRecordEdit.mockReset();

    const { getByRole, getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <ProfileRecord index={index} record={baseRecord} path={["record"]} />
      </StoreContext.Provider>
    ));

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("uuid");

    const add = getByText("Add branch");

    await userEvent.click(add);

    expect(onRecordEdit).toHaveBeenCalledWith(["record", "branch"], {
      _: "branch",
      branch: "",
    });

    expect(store.record).toEqual({
      _: "repo",
      repo: "uuid",
      branch: {
        _: "branch",
        branch: "",
      },
    });
  });

  test("adds another branch", async () => {
    const index = "index";

    const branch = "branch";

    const baseRecord = {
      _: "repo",
      repo: "uuid",
      branch: [
        {
          _: "branch",
          branch: "",
        },
      ],
    };

    setStore("record", baseRecord);

    onRecordEdit.mockReset();

    const { getByRole, getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <ProfileRecord index={index} record={baseRecord} path={["record"]} />
      </StoreContext.Provider>
    ));

    const add = getByText("Add another branch");

    await userEvent.click(add);

    expect(onRecordEdit).toHaveBeenCalledWith(["record", "branch", 1], {
      _: "branch",
      branch: "",
    });

    expect(store.record).toEqual({
      _: "repo",
      repo: "uuid",
      branch: [
        {
          _: "branch",
          branch: "",
        },
        {
          _: "branch",
          branch: "",
        },
      ],
    });
  });

  test("adds description", async () => {
    const index = "index";

    const branch = "branch";

    const item = {
      _: "branch",
      branch: "",
    };

    const baseRecord = {
      _: "repo",
      repo: "uuid",
      branch: [item],
    };

    setStore("record", baseRecord);

    onRecordEdit.mockReset();

    const { getByRole, getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <ProfileRecord
          index={index}
          record={item}
          path={["record", "branch", 0]}
        />
      </StoreContext.Provider>
    ));

    const add = getByText("Add description_en");

    await userEvent.click(add);

    expect(onRecordEdit).toHaveBeenCalledWith(
      ["record", "branch", 0, "description_en"],
      {
        _: "description_en",
        description_en: "",
      },
    );

    expect(store.record).toEqual({
      _: "repo",
      repo: "uuid",
      branch: [
        {
          _: "branch",
          branch: "",
          description_en: {
            _: "description_en",
            description_en: "",
          },
        },
      ],
    });
  });
});
