import { Buffer } from "buffer";
import csvs from "@fetsorn/csvs-js";
import mindzoo from "@fetsorn/mindzoo";
import mindbook from "@fetsorn/mindbook";
import LightningFS from "@isomorphic-git/lightning-fs";
import { startEvenor } from "../../public/glue.js";

export async function setup() {
    window.Buffer = window.Buffer || Buffer;

    // prepare root element
    let root = document.getElementById("root");
    if (!root) {
        root = document.createElement("div");
        root.id = "root";
        root.className = "root";
        document.body.appendChild(root);
    }

    const fs = new LightningFS("fs");

    await startEvenor({ fs, mindbook, csvs, mindzoo });
}
