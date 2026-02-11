/**
 * Código para conectar tu Google Sheet con el Dashboard Miguelini.
 *
 * CÓMO USAR:
 * 1. Abre tu Google Sheet (o crea uno nuevo).
 * 2. Menú: Extensiones → Apps Script.
 * 3. Borra cualquier código que haya y pega TODO este archivo.
 * 4. Guarda (Ctrl+S). Nombre del proyecto: por ejemplo "Miguelini Sync".
 * 5. Despliega: Implementar → Nueva implementación → Tipo: Aplicación web.
 *    - Descripción: "Sync con dashboard"
 *    - Ejecutar como: Yo
 *    - Quién puede acceder: Cualquier persona
 * 6. Haz clic en Implementar. Copia la URL que termina en /exec.
 * 7. En el dashboard (Datos → Conectar con Google Sheet) pega esa URL.
 *
 * ENVIAR datos al Sheet: en el dashboard clic en "Enviar datos al Sheet".
 * TRAER datos del Sheet: clic en "Traer datos del Sheet".
 */

var SHEET_NAME = 'Datos'; // nombre de la pestaña donde se escriben los datos

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

/**
 * Recibe un POST con el body = JSON array de transacciones y escribe en la hoja.
 */
function doPost(e) {
  try {
    var raw = e.postData && e.postData.contents ? e.postData.contents : '[]';
    var data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      return jsonResponse({ ok: false, error: 'Se esperaba un array' });
    }
    var sheet = getSheet();
    sheet.clear();
    var headers = ['Tipo', 'Descripción', 'Monto', 'Categoría', 'Fecha', 'Método pago', 'Notas', 'Acreedor', 'Deuda total', 'Pago mensual', 'Pagado', 'Data'];
    sheet.appendRow(headers);
    data.forEach(function(item) {
      var date = item.date || (item.createdAt ? item.createdAt.split('T')[0] : '');
      sheet.appendRow([
        item.type || '',
        item.description || '',
        item.amount != null ? item.amount : '',
        item.category || '',
        date,
        item.paymentMethod || '',
        item.notes || '',
        item.creditor || '',
        item.totalDebt != null ? item.totalDebt : '',
        item.monthlyPayment != null ? item.monthlyPayment : '',
        item.paidAmount != null ? item.paidAmount : '',
        JSON.stringify(item)
      ]);
    });
    return jsonResponse({ ok: true, count: data.length });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/**
 * Responde con el contenido del Sheet como JSON (array de transacciones).
 * La columna "Data" (L) tiene el JSON completo de cada fila.
 */
function doGet(e) {
  try {
    var sheet = getSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return jsonResponse([]);
    }
    var dataColumn = 12; // columna L = Data
    var range = sheet.getRange(2, dataColumn, lastRow, dataColumn);
    var values = range.getValues();
    var out = [];
    for (var i = 0; i < values.length; i++) {
      try {
        var obj = JSON.parse(values[i][0]);
        if (obj) out.push(obj);
      } catch (err) {}
    }
    return jsonResponse(out);
  } catch (err) {
    return jsonResponse({ error: String(err) });
  }
}

function jsonResponse(obj) {
  var text = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
}
