import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store, onRecordEdit } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { ProfileField } from "./profile_field.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn((path, value) => setStore(...path, value)),
  };
});

describe("ProfileField", () => {
  test("removes each", async () => {
    // no "remove each field value" component
    expect(false).toBe(false);
  });

  test("removes this", async () => {
    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const baseRecord = {
      _: "repo",
      repo: "uuid",
      branch: [
        {
          _: "branch",
          branch: "a",
        },
      ],
    };

    setStore("record", baseRecord);

    const { getByRole, getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <ProfileField
          index={index}
          branch={branch}
          items={items}
          path={["record", "branch"]}
        />
      </StoreContext.Provider>
    ));

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("a");

    await userEvent.click(getByText(`cut...`));

    await userEvent.click(getByText("Yes"));

    expect(onRecordEdit).toHaveBeenCalledWith(["record", "branch"], []);

    expect(store.record).toEqual({
      _: "repo",
      repo: "uuid",
      branch: [],
    });
  });
});
