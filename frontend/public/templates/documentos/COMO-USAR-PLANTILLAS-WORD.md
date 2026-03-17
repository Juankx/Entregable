# Cómo subir y usar plantillas WORD con los JSON de plantillaContratos

## 1. Dónde están las cosas

- **Plantillas WORD (aquí):**  
  `frontend/public/templates/documentos/`  
  Aquí debes colocar tus archivos `.docx`.

- **Datos JSON (referencia):**  
  `frontend/public/templates/plantillaContratos/`  
  Ahí están los JSON que se usan para rellenar las plantillas. Cada JSON define la estructura de datos de un tipo de documento.

---

## 2. Pasos para que tú lo hagas manualmente

### Paso 1: Crear o editar el Word

1. Crea el documento en Word (o abre uno que ya tengas).
2. Donde quieras que luego se rellene un dato del JSON, escribe un **marcador** con esta forma:
   - `{{nombre.del.campo}}`
   - Ejemplos:
     - `{{company.legal_name}}`
     - `{{client.full_name}}`
     - `{{card_authorization.amount.numeric}}`
     - `{{empresa.razon_social}}`
3. Guarda el archivo como `.docx`.

### Paso 2: Nombrar el archivo igual que el JSON

Para que el sistema sepa qué JSON usar con cada Word, el nombre del Word debe coincidir con el del JSON (sin la extensión):

| JSON en plantillaContratos     | Word que debes subir a documentos      |
|--------------------------------|----------------------------------------|
| autorizacion-cobro-pacifico.json | **autorizacion-cobro-pacifico.docx**   |
| anexo-beneficios-ventajas.json   | **anexo-beneficios-ventajas.docx**     |
| pagare-credito.json             | **pagare-credito.docx**                |
| carta-diferimiento.json         | **carta-diferimiento.docx**             |
| contrato-prestacion-servicios.json | **contrato-prestacion-servicios.docx** |
| documento-entendimiento-aceptacion.json | **documento-entendimiento-aceptacion.docx** |
| hoja-bienvenida.json            | **hoja-bienvenida.docx**               |
| consentimiento-grabacion-imagenes.json | **consentimiento-grabacion-imagenes.docx** |
| solicitud-activacion-contrato.json | **solicitud-activacion-contrato.docx** |

Es decir: mismo nombre, extensión `.docx` en la carpeta **documentos**.

### Paso 3: Subir el Word a la carpeta documentos

1. Abre en el explorador de archivos:
   - `Entregable/frontend/public/templates/documentos`
2. Copia tu archivo `.docx` ahí (o arrástralo).
3. Comprueba que el nombre sea exactamente el indicado (por ejemplo `autorizacion-cobro-pacifico.docx`).

---

## 3. Qué campos puedes usar en los marcadores

Depende del JSON. Aquí van los más usados según cada tipo.

### Si tu Word va con **autorizacion-cobro-pacifico.json**

- Empresa: `{{company.legal_name}}`, `{{company.commercial_name}}`, `{{company.ruc}}`
- Contacto: `{{company.contact.email}}`, `{{company.contact.phone}}`
- Dirección: `{{company.contact.address.street}}`, `{{company.contact.address.building}}`, etc.
- Cliente: `{{client.full_name}}`, `{{client.phone}}`, `{{client.id_number}}`, `{{client.city_country}}`
- Tarjeta: `{{card_authorization.cardholder_name}}`, `{{card_authorization.card_type}}`, `{{card_authorization.card_number}}`, `{{card_authorization.expiration_date}}`
- Monto: `{{card_authorization.amount.numeric}}`, `{{card_authorization.amount.text}}`, `{{card_authorization.amount.currency}}`
- Finalidad: `{{card_authorization.purpose}}`
- Voucher: `{{card_authorization.voucher.batch_number}}`, `{{card_authorization.voucher.reference_number}}`, etc.

### Si tu Word va con **anexo-beneficios-ventajas.json**

- `{{documento.titulo}}`, `{{documento.programa}}`, `{{documento.fecha_firma}}`
- `{{contrato.numero_contrato}}`, `{{titular.nombres_completos}}`, `{{empresa.razon_social}}`, `{{empresa.ruc}}`
- Y los que veas dentro de `beneficios.*` en ese JSON.

Para los demás JSON, abre el `.json` correspondiente en `plantillaContratos` y usa la misma regla: cada clave anidada se escribe con puntos, por ejemplo `{{seccion.subseccion.campo}}`.

---

## 4. Resumen rápido

1. Crear/editar el Word con marcadores `{{campo.del.json}}`.
2. Guardar como `.docx` con **el mismo nombre** que el JSON (ej. `autorizacion-cobro-pacifico.docx`).
3. Copiar ese `.docx` en **`Entregable/frontend/public/templates/documentos`**.

**La app ya usa estas plantillas:** al generar un documento (contrato, anexo, pagaré, etc.) desde Gestión de Contratos, la aplicación lee el `.docx` de esta carpeta, rellena los marcadores `{{...}}` con los datos del JSON (cliente/contrato) y genera el PDF correspondiente. Si no encuentra el `.docx`, usa el generador HTML como respaldo.
