import { describe, expect, test } from "vitest";
import { queryToAlgebra } from "@/algebra.js";
import { parseQueryString } from "@/pure.js";
import { toAst } from "@traqula/algebra-sparql-1-1";
import { Generator } from "@traqula/generator-sparql-1-1";

const NS = "urn:uuid:test-mind";
const keywords = ["date", "name", "location", "coordinates"];
const schema = {
  mind: { trunks: [], leaves: ["date", "name", "location"] },
  date: { trunks: ["mind"], leaves: [] },
  name: { trunks: ["mind"], leaves: [] },
  location: { trunks: ["mind"], leaves: ["coordinates"] },
  coordinates: { trunks: ["location"], leaves: [] },
};

const generator = new Generator();

function toSparql(algebra) {
  return generator.generate(toAst(algebra));
}

describe("queryToAlgebra", () => {
  test("empty query — SELECT with empty BGP", () => {
    const parsed = parseQueryString("", keywords);
    const algebra = queryToAlgebra("mind", parsed, NS, schema);

    expect(algebra.type).toBe("project");
    expect(algebra.input.type).toBe("bgp");
    expect(algebra.input.patterns).toHaveLength(0);

    const sparql = toSparql(algebra);
    expect(sparql).toContain("SELECT");
  });

  test("keyword only — BGP with literal pattern", () => {
    const parsed = parseQueryString("date:2024", keywords);
    const algebra = queryToAlgebra("mind", parsed, NS, schema);

    const sparql = toSparql(algebra);
    expect(sparql).toContain("<urn:uuid:test-mind#date>");
    expect(sparql).toContain('"2024"');
  });

  test("nested keyword — path through trunks", () => {
    const parsed = parseQueryString("coordinates:48.8", keywords);
    const algebra = queryToAlgebra("mind", parsed, NS, schema);

    const sparql = toSparql(algebra);
    // should chain: ?mind <#location> ?location_v . ?location_v <#coordinates> "48.8"
    expect(sparql).toContain("<urn:uuid:test-mind#location>");
    expect(sparql).toContain("<urn:uuid:test-mind#coordinates>");
    expect(sparql).toContain('"48.8"');
  });

  test("freeform — UNION across entire crown (including nested)", () => {
    const parsed = parseQueryString("hello", keywords);
    const algebra = queryToAlgebra("mind", parsed, NS, schema);

    const sparql = toSparql(algebra);
    expect(sparql).toContain("UNION");
    expect(sparql).toContain("REGEX");
    // should search all 5 branches: mind, date, name, location, coordinates
    expect(sparql).toContain("<urn:uuid:test-mind#mind>");
    expect(sparql).toContain("<urn:uuid:test-mind#date>");
    expect(sparql).toContain("<urn:uuid:test-mind#name>");
    expect(sparql).toContain("<urn:uuid:test-mind#location>");
    expect(sparql).toContain("<urn:uuid:test-mind#coordinates>");
  });

  test("mixed freeform + keyword — UNION skips constrained branch", () => {
    const parsed = parseQueryString("hello date:2024", keywords);
    const algebra = queryToAlgebra("mind", parsed, NS, schema);

    const sparql = toSparql(algebra);
    expect(sparql).toContain("UNION");
    expect(sparql).toContain('"2024"');
    expect(sparql).toContain("REGEX");
  });

  test("keyword with empty value — variable object", () => {
    const parsed = parseQueryString("date:", keywords);
    const algebra = queryToAlgebra("mind", parsed, NS, schema);

    const sparql = toSparql(algebra);
    expect(sparql).toContain("?date_v");
  });

  test("multiple freeform words — joined with space in regex", () => {
    const parsed = parseQueryString("hello world", keywords);
    const algebra = queryToAlgebra("mind", parsed, NS, schema);

    const sparql = toSparql(algebra);
    expect(sparql).toContain("hello world");
  });

  test("nested keyword + freeform — path patterns in UNION arms", () => {
    const parsed = parseQueryString("hello coordinates:48.8", keywords);
    const algebra = queryToAlgebra("mind", parsed, NS, schema);

    const sparql = toSparql(algebra);
    // keyword generates path: ?mind <#location> ?location_v . ?location_v <#coordinates> "48.8"
    // freeform searches remaining branches
    expect(sparql).toContain("UNION");
    expect(sparql).toContain('"48.8"');
    expect(sparql).toContain("REGEX");
  });
});
