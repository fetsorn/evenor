import * as latex from "../../../../lib/pdf_tex_engine";

export async function exportPDF(textext: string) {
  const globalEn = new latex.PdfTeXEngine();

  await globalEn.loadEngine();

  if (!globalEn.isReady()) {
    console.log("Engine not ready yet");

    return;
  }

  globalEn.writeMemFSFile("main.tex", textext);

  globalEn.setEngineMainFile("main.tex");

  const r: any = await globalEn.compileLaTeX();

  console.log(r);

  if (r.status === 0) {
    const pdfblob = new Blob([r.pdf], { type: "application/pdf" });

    const objectURL = URL.createObjectURL(pdfblob);

    setTimeout(() => {
      URL.revokeObjectURL(objectURL);
    }, 30000);

    console.log(objectURL);

    return objectURL;
  }
}
