import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore, onStartup } from "@/store/store.js";
import { NavigationMenu } from "./navigation_menu.jsx";

describe("NavigationMenu", () => {
  test("", async () => {
    expect(false).toEqual(true);
  });
});
