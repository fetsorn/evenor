export function isTauri() {
  return Boolean(
    typeof window === "undefined" || window.__TAURI__ !== undefined,
  );
}

export async function click(element) {
  await element.waitForExist({ timeout: 5000 });

  if (isTauri()) {
    // element.click() doesn't work on tauri
    // https://github.com/tauri-apps/tauri/issues/6541
    await browser.execute("arguments[0].click();", element);
  } else {
    // polyfill doesn't work in browser
    await element.click();
  }
}

export async function setValue(field, value) {
  await field.waitForExist({ timeout: 5000 });

  if (isTauri()) {
    // element.setValue(value) doesn't work on tauri
    // https://github.com/tauri-apps/tauri/issues/6541
    await browser.execute(`arguments[0].value="${value}"`, field);
    await browser.execute(
      'arguments[0].dispatchEvent(new Event("input", { bubbles: true }))',
      field,
    );
  } else {
    const tagName = await field.getTagName();

    if (tagName === "input" || tagName === "textarea") {
      await field.setValue(value);
    } else {
      // contenteditable (tiptap ProseMirror) — select all then type
      await field.click();
      await browser.execute((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }, field);
      await browser.keys(value.split(""));
    }
  }
}
