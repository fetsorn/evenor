import { click, setValue } from "./actions.js";
import { draft, save } from "./create.js";
import { open } from "./open.js";

export async function clone() {
  await draft();

  await setValue(await $("aria/name -"), "foobar");

  await click(await $("aria/add"));

  await click(await $("aria/origin_url"));

  await setValue(
    await $("aria/origin_url -"),
    "http://localhost:8174/test-mind1.git",
  );

  await click(await $("aria/clone..."));

  await click(await $("aria/Yes"));
  await (await $("aria/Yes")).waitForExist({ reverse: true, timeout: 5000 });

  await (
    await $("aria/Loading...")
  ).waitForExist({ reverse: true, timeout: 5000 });

  await save();
}

export function testClone() {
  it("should clone a mind", async () => {
    await clone();

    await open();

    // should find 7 events in the cloned mind
    await (
      await $("aria/found")
    ).waitUntil(
      async function () {
        return (await this.getText()) === "found 7";
      },
      {
        timeout: 5000,
      },
    );
  });
}
