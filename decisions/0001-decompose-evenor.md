# ADR-0001: Decompose evenor into mindzoo, csvs libs, and rhetorical UI

## Status

Active

## Context

Evenor currently bundles four concerns into one application:

- Virtual filesystem abstraction (indexedb / tauri)
- Git repo management (clone, sync, push, merge)
- CSVS dataset querying and mutation (QON/SON)
- Rhetorical interface for structured data editing

This makes it difficult to onboard users who need only one capability. QON/SON is not legible to the SPARQL ecosystem. The coupling prevents independent development and marketing of each piece.

CSVS libraries will gain SPARQL support, with QON compiled to SPARQL before execution. This makes it possible for the UI to speak SPARQL to a standard endpoint rather than QON to a custom API.

## Decision

Decompose evenor into three independent products and one integration layer:

### mindzoo -- git on injected filesystem

- Accepts an injected virtual filesystem (lightningfs, tauri FS, or any implementation matching the FS trait/interface)
- Provides opinionated repo management: create, clone, delete, list, sync (commit + pull + push), conflict resolution
- Uses git2kit-rs / isogit as internal dependencies
- Does not know what is inside the files -- no opinion on content format
- Marketable independently to the tauri ecosystem

### csvs libs (csvs-js, csvs-rs) -- SPARQL over CSV files

- Accept SPARQL queries and updates, read/write CSVS files
- QON API retained for compatibility, compiles to SPARQL before execution
- No opinion on where files live -- consumer provides file access
- Marketable independently for ETL and data projects
- SON retained as query result format (competitor to SRX/SRJ/SRC); SPARQL result formats not required for now

### rhetorical UI (magicbook) -- schema-agnostic structured data editor

- Renders interactive legible text from structured data ("parent X with child Y")
- Talks SPARQL to whatever endpoint it is given
- Schema-agnostic: does not assume events or any specific domain
- Runs entirely client-side in a browser

### evenor -- the full application

- Glue layer: initializes filesystem, initializes mindzoo, initializes csvs libs with SPARQL, serves the rhetorical UI
- Ships as desktop/mobile application via tauri
- Provides a default event-focused schema
- The evenor repo serves as integration test for the three products above
- Owns the streaming IPC bridge: csvs libs return streams, evenor pipes them over IPC (tauri) or directly (browser) into the UI for quick first paint

## Migration path

- The three products split apart on their current APIs — mindzoo speaks git, csvs libs speak QON/SON, rhetorical UI speaks QON/SON. SPARQL replaces QON later as a separate migration step, not a prerequisite for the split.
- mindzoo is a code library extraction -- lowest risk, mostly packaging
- Streaming optimization: csvs libs already stream results; the IPC streaming layer is evenor glue, not csvs concern. SPARQL also streams variable bindings natively, so the pattern holds.
- Evenor's existing test suite serves as integration test for the decomposition -- all three products must compose to pass current tests

## Consequences

- Each product has a self-contained pitch and can onboard users independently
- mindzoo does not depend on RDF or SPARQL concepts
- csvs libs do not depend on git or filesystem abstraction
- The rhetorical UI does not depend on csvs or mindzoo -- any SPARQL endpoint works
- Repo management (catalog) is mindzoo's API, not SPARQL -- it handles side effects (git, filesystem) that SPARQL cannot express
- Schema management (adding/removing relation types) is SPARQL UPDATE -- schema is just triples
- The current evenor URL-token-based repo cloning maps to mindzoo.clone(url, token)
- The current resolve-on-mutation hook maps to the consumer calling repoHandle.sync()
