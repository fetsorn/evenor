import { click } from "./actions.js";
import { open } from "./open.js";
import { createMind, createEvent } from "./create.js";

export async function search() {
  await (await $("aria/search")).waitForExist({ timeout: 5000 });

  await click(await $("aria/search"));
}

export function testSearch() {
  it("should open a mind", async () => {
    await createMind();

    // check that one record in the overview
    await open();

    await createEvent();

    await search();
  });
}
