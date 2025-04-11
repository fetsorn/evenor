export const schema = {
  a: { trunks: [], leaves: ["b"] },
  b: { trunks: ["a"], leaves: ["d"] },
  d: { trunks: ["b"], leaves: [] },
};

export const root = "a";

export const trunk = "b";

export const twig = "d";

export const nonExisting = "c";

export const cases = {
  noBase: {
    queries: { _: "a", a: "1" },
    searchParams: new URLSearchParams("a=1"),
  },
  baseValue: {
    queries: { _: "a", a: "1" },
    searchParams: new URLSearchParams("?_=a&a=1"),
  },
  leafValue: {
    queries: { _: "a", b: "2" },
    searchParams: new URLSearchParams("?_=a&b=2"),
  },
  twigOutOfOrder: {
    queries: { _: "a", b: { _: "b", b: "2", d: "3" } },
    searchParams: new URLSearchParams("?_=a&d=3&b=2"),
  },
};

export default {
  schema,
  root,
  trunk,
  twig,
  nonExisting,
  cases,
};
