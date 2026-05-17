import { click } from "./actions.js";
import { createMind } from "./create.js";

export async function search() {
  await (await $("aria/search")).waitForExist({ timeout: 5000 });

  await click(await $("aria/search"));
}

export function testSearch() {
  it("should search", async () => {
    await createMind();

    await search();
  });
}
