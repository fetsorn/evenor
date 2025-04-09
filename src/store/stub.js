export const schema = {
  a: { trunks: [], leaves: ["b"] },
  b: { trunks: ["a"], leaves: [] },
};

export const trunk = "a";

export const twig = "b";

export const nonExisting = "c";

export const queries = { a: "b" };

export const searchParams = new URLSearchParams("?a=b");

export default {
  schema,
  trunk,
  twig,
  nonExisting,
  queries,
  searchParams,
};
