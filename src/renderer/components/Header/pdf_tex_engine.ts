/********************************************************************************
 * Copyright (C) 2019 Elliott Wen.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

export const EngineStatus = {
  Init: 1,
  Ready: 2,
  Busy: 3,
  Error: 4,
};

const ENGINE_PATH = "swiftlatexpdftex.js";

export class CompileResult {
  pdf: any = undefined;
  status = -254;
  log = "No log";
}

export class PdfTeXEngine {
  latexWorker: any = undefined;
  latexWorkerStatus = EngineStatus.Init;
  constructor() {}

  async loadEngine() {
    if (this.latexWorker !== undefined) {
      throw new Error("Other instance is running, abort()");
    }
    this.latexWorkerStatus = EngineStatus.Init;
    await new Promise<void>((resolve, reject) => {
      this.latexWorker = new Worker(ENGINE_PATH);
      this.latexWorker.onmessage = (ev: any) => {
        const data = ev["data"];
        const cmd = data["result"];
        if (cmd === "ok") {
          this.latexWorkerStatus = EngineStatus.Ready;
          resolve();
        } else {
          this.latexWorkerStatus = EngineStatus.Error;
          reject();
        }
      };
    });
    this.latexWorker.onmessage = (_: any) => {};
    this.latexWorker.onerror = (_: any) => {};
  }

  isReady() {
    return this.latexWorkerStatus === EngineStatus.Ready;
  }

  checkEngineStatus() {
    if (!this.isReady()) {
      throw Error("Engine is still spinning or not ready yet!");
    }
  }

  async compileLaTeX() {
    this.checkEngineStatus();
    this.latexWorkerStatus = EngineStatus.Busy;
    const start_compile_time = performance.now();
    const res = await new Promise((resolve, _) => {
      this.latexWorker.onmessage = (ev: any) => {
        const data = ev["data"];
        const cmd = data["cmd"];
        if (cmd !== "compile") return;
        const result = data["result"];
        const log = data["log"];
        const status = data["status"];
        this.latexWorkerStatus = EngineStatus.Ready;
        console.log(
          "Engine compilation finish " +
            (performance.now() - start_compile_time)
        );
        const nice_report = new CompileResult();
        nice_report.status = status;
        nice_report.log = log;
        if (result === "ok") {
          const pdf = new Uint8Array(data["pdf"]);
          nice_report.pdf = pdf;
        }
        resolve(nice_report);
      };
      this.latexWorker.postMessage({ cmd: "compilelatex" });
      console.log("Engine compilation start");
    });
    this.latexWorker.onmessage = (_: any) => {};

    return res;
  }

  /* Internal Use */
  async compileFormat() {
    this.checkEngineStatus();
    this.latexWorkerStatus = EngineStatus.Busy;
    await new Promise<void>((resolve, reject) => {
      this.latexWorker.onmessage = (ev: any) => {
        const data = ev["data"];
        const cmd = data["cmd"];
        if (cmd !== "compile") return;
        const result = data["result"];
        const log = data["log"];
        // const status = data['status'];
        this.latexWorkerStatus = EngineStatus.Ready;
        if (result === "ok") {
          const formatArray = data["pdf"]; /* PDF for result */
          const formatBlob = new Blob([formatArray], {
            type: "application/octet-stream",
          });
          const formatURL = URL.createObjectURL(formatBlob);
          setTimeout(() => {
            URL.revokeObjectURL(formatURL);
          }, 30000);
          console.log("Download format file via " + formatURL);
          resolve();
        } else {
          reject(log);
        }
      };
      this.latexWorker.postMessage({ cmd: "compileformat" });
    });
    this.latexWorker.onmessage = (_: any) => {};
  }

  setEngineMainFile(filename: any) {
    this.checkEngineStatus();
    if (this.latexWorker !== undefined) {
      this.latexWorker.postMessage({ cmd: "setmainfile", url: filename });
    }
  }

  writeMemFSFile(filename: any, srccode: any) {
    this.checkEngineStatus();
    if (this.latexWorker !== undefined) {
      this.latexWorker.postMessage({
        cmd: "writefile",
        url: filename,
        src: srccode,
      });
    }
  }

  makeMemFSFolder(folder: any) {
    this.checkEngineStatus();
    if (this.latexWorker !== undefined) {
      if (folder === "" || folder === "/") {
        return;
      }
      this.latexWorker.postMessage({ cmd: "mkdir", url: folder });
    }
  }

  flushCache() {
    this.checkEngineStatus();
    if (this.latexWorker !== undefined) {
      // console.warn('Flushing');
      this.latexWorker.postMessage({ cmd: "flushcache" });
    }
  }

  setTexliveEndpoint(url: any) {
    if (this.latexWorker !== undefined) {
      this.latexWorker.postMessage({ cmd: "settexliveurl", url: url });
    }
  }

  closeWorker() {
    if (this.latexWorker !== undefined) {
      this.latexWorker.postMessage({ cmd: "grace" });
      this.latexWorker = undefined;
    }
  }
}
