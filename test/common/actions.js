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
      // contenteditable (tiptap ProseMirror) — use execCommand to
      // insert text, which triggers tiptap's input handling properly
      await field.click();
      await browser.execute((el, val) => {
        el.focus();
        // select all existing content for replacement
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        // insert text via execCommand — triggers tiptap onUpdate
        document.execCommand("insertText", false, val);
      }, field, value);
    }
  }
}
