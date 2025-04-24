import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { Profile } from "./profile.jsx";
import { ProfileRecord } from "./components/index.js";

vi.mock("./components/index.js", () => {
  // don't await original import, it hangs, likely because of reexports
  return {
    ProfileRecord: vi.fn(),
  };
});

describe("Profile", () => {
  test("", () => {
    const baseRecord = { _: "repo", repo: "uuid" };

    setStore("record", baseRecord);

    render(() => (
      <StoreContext.Provider value={{ store }}>
        <Profile />
      </StoreContext.Provider>
    ));

    expect(ProfileRecord).toHaveBeenCalledWith({
      index: "_",
      record: {
        _: "repo",
        repo: "uuid",
      },
      path: ["record"],
    });
  });
});
