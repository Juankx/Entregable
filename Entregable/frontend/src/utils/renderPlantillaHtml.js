import { contratoPrestacionServiciosToHtml } from './contratoPrestacionServiciosToHtml';
import { autorizacionCobroPacificoToHtml } from './autorizacionCobroPacificoToHtml';
import { cartaDiferimientoToHtml } from './cartaDiferimientoToHtml';
import { hojaBienvenidaToHtml } from './hojaBienvenidaToHtml';
import { pagareCreditoToHtml } from './pagareCreditoToHtml';
import { documentoEntendimientoAceptacionToHtml } from './documentoEntendimientoAceptacionToHtml';
import { solicitudActivacionContratoToHtml } from './solicitudActivacionContratoToHtml';
import { reglasIncorporacionDocumentosToHtml } from './reglasIncorporacionDocumentosToHtml';
import { consentimientoGrabacionImagenesToHtml } from './consentimientoGrabacionImagenesToHtml';
import { anexoBeneficiosVentajasToHtml } from './anexoBeneficiosVentajasToHtml';
import { checklistDocumentosToHtml } from './checklistDocumentosToHtml';

export function renderPlantillaHtml(plantillaId, data) {
  switch (plantillaId) {
    case 'autorizacion-cobro-pacifico':
      return autorizacionCobroPacificoToHtml(data);

    case 'carta-diferimiento':
      return cartaDiferimientoToHtml(data);

    case 'hoja-bienvenida':
      return hojaBienvenidaToHtml(data);

    case 'pagare':
    case 'pagare-credito':
      return pagareCreditoToHtml(data);

    case 'documento-entendimiento':
    case 'documento-entendimiento-aceptacion':
      return documentoEntendimientoAceptacionToHtml(data);

    case 'solicitud-activacion':
    case 'solicitud-activacion-contrato':
      return solicitudActivacionContratoToHtml(data);

    case 'reglas-incorporacion-documentos':
      return reglasIncorporacionDocumentosToHtml(data);

    case 'consentimiento-grabacion':
    case 'consentimiento-grabacion-imagenes':
      return consentimientoGrabacionImagenesToHtml(data);

    case 'checklist-documentos':
      return checklistDocumentosToHtml(data);

    case 'anexo-beneficios':
    case 'anexo-beneficios-ventajas':
      return anexoBeneficiosVentajasToHtml(data);

    case 'contrato-servicios':
    case 'contrato-prestacion-servicios':
    case 'contrato-basico':
      return contratoPrestacionServiciosToHtml(data);

    default:
      console.warn(`No existe renderer HTML para la plantilla: ${plantillaId}`, data);
      return '';
  }
}