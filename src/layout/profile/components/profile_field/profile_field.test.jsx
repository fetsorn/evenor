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
    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const baseRecord = {
      _: "repo",
      repo: "uuid",
      branch: {
        _: "branch",
        branch: "a",
      },
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

    // for some reason spoiler state is shared between test cases
    try {
      const ellipsis = getByText(`${branch}...`);

      await userEvent.click(ellipsis);
    } catch {}

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("a");

    const remove = getByText("Remove each branch");

    await userEvent.click(remove);

    const yes = getByText("Yes");

    await userEvent.click(yes);

    expect(onRecordEdit).toHaveBeenCalledWith(["record", "branch"], undefined);

    expect(store.record).toEqual({
      _: "repo",
      repo: "uuid",
    });
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

    const remove = getByText("Remove this branch");

    await userEvent.click(remove);

    const yes = getByText("Yes");

    await userEvent.click(yes);

    expect(onRecordEdit).toHaveBeenCalledWith(["record", "branch"], []);

    expect(store.record).toEqual({
      _: "repo",
      repo: "uuid",
      branch: [],
    });
  });
});
