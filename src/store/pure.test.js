import { expect, test } from "vitest";
import { isTwig } from "./pure.js";

test("is a twig", () => {
  expect(isTwig({ a: { trunks: [], leaves: [] } }, "a")).toBe(true);
});
