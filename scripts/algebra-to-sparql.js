import { toAst } from "@traqula/algebra-sparql-1-1";
import { Generator } from "@traqula/generator-sparql-1-1";
import { parseQueryString, buildQuery } from "../src/query.js";
import { queryToAlgebra } from "../src/algebra.js";
import { writeFileSync } from "node:fs";

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

const queries = [
  { label: "empty", input: "" },
  { label: "keyword only", input: "date:2024" },
  { label: "multiple keywords", input: "date:2024 name:john" },
  { label: "freeform only", input: "hello" },
  { label: "mixed freeform + keyword", input: "hello date:2024 world" },
  { label: "keyword empty value", input: "date:" },
  { label: "nested keyword", input: "coordinates:48.8" },
  { label: "nested keyword + freeform", input: "hello coordinates:48.8" },
  { label: "sibling keywords sharing path", input: "location:paris coordinates:48.8" },
  { label: "all levels", input: "hello date:2024 location:paris coordinates:48.8" },
];

let output = "";

for (const { label, input } of queries) {
  const parsed = parseQueryString(input, keywords);

  output += `# ${label}: "${input}"\n`;
  output += `# parsed: ${JSON.stringify(parsed)}\n`;

  // QON output
  const qon = buildQuery("mind", parsed, schema);
  output += `# qon: ${JSON.stringify(qon, null, 2)}\n`;

  // SPARQL output
  try {
    const algebra = queryToAlgebra("mind", parsed, NS, schema);
    const ast = toAst(algebra);
    const sparql = generator.generate(ast);
    output += sparql + "\n";
  } catch (e) {
    output += `# SPARQL ERROR: ${e.message}\n`;
  }

  output += "\n";
}

writeFileSync("scripts/output.sparql", output);
console.log(output);
