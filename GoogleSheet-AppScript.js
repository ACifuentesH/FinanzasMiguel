/**
 * Una sola hoja de cálculo conectada al Dashboard Miguelini.
 * Los datos se cargan al abrir el dashboard y se guardan solos en cada cambio.
 *
 * CÓMO USAR:
 * 1. Crea o abre un Google Sheet.
 * 2. Extensiones → Apps Script. Borra el código y pega TODO este archivo. Guarda.
 * 3. Implementar → Nueva implementación → Tipo: Aplicación web.
 *    Ejecutar como: Yo. Quién puede acceder: Cualquier persona.
 * 4. Implementar y copiar la URL (termina en /exec).
 * 5. En el dashboard (Configuración → Datos) pega esa URL. Listo: misma hoja en todos los dispositivos.
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
 * Si viene ?callback=nombre, devuelve JSONP (nombre(datos)) para evitar CORS en el dashboard.
 * La columna "Data" (L) tiene el JSON completo de cada fila.
 */
function doGet(e) {
  try {
    var sheet = getSheet();
    var lastRow = sheet.getLastRow();
    var out = [];
    if (lastRow >= 2) {
      var dataColumn = 12; // columna L = Data
      var range = sheet.getRange(2, dataColumn, lastRow, dataColumn);
      var values = range.getValues();
      for (var i = 0; i < values.length; i++) {
        try {
          var obj = JSON.parse(values[i][0]);
          if (obj) out.push(obj);
        } catch (err) {}
      }
    }
    var callback = (e && e.parameter && e.parameter.callback) ? String(e.parameter.callback).trim() : '';
    if (callback && /^[a-zA-Z0-9_.]+$/.test(callback)) {
      var jsonp = callback + '(' + JSON.stringify(out) + ')';
      return ContentService.createTextOutput(jsonp).setMimeType(ContentService.MimeType.JAVASCRIPT);
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
