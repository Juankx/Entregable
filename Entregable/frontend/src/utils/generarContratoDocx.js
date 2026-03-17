import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

export async function generarContratoDocx(data) {
  try {
    const response = await fetch("/templates/plantillaContratos/plantilla_contrato_innovation_business.docx");

    if (!response.ok) {
      throw new Error(`No se pudo cargar la plantilla. Status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    const zip = new PizZip(arrayBuffer);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render(data);

    const blob = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(blob, `contrato-${data.numero_contrato || Date.now()}.docx`);
  } catch (error) {
    console.error("Error generando contrato:", error);
    throw error;
  }
}