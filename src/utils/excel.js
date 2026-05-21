import * as XLSX from 'xlsx';

export const ACCEPTED_EXTENSIONS = ['xlsx', 'xls', 'csv'];

export function validateInputFile(file) {
  if (!file) return 'No se seleccionó ningún archivo.';
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return 'Formato inválido. Subí un archivo .xlsx, .xls o .csv.';
  }
  return null;
}

export async function readExcelFile(file) {
  const validationError = validateInputFile(file);
  if (validationError) throw new Error(validationError);

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false,
      blankrows: false,
    });

    const columns = extractColumns(rows);

    return {
      name: sheetName,
      rows,
      columns,
    };
  });

  if (!sheets.length) throw new Error('El archivo no contiene hojas válidas.');

  return {
    fileName: file.name,
    sheets,
    selectedSheetName: sheets[0].name,
  };
}

export function extractColumns(rows) {
  const columns = new Set();
  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => {
      if (String(key).trim()) columns.add(key);
    });
  });
  return Array.from(columns);
}

export function getSelectedSheet(fileData) {
  if (!fileData) return null;
  return fileData.sheets.find((sheet) => sheet.name === fileData.selectedSheetName) || fileData.sheets[0];
}

export function exportToExcel({ resultRows, summary, notFoundRows, duplicateRows, fileName = 'resultado_cruce.xlsx' }) {
  const workbook = XLSX.utils.book_new();

  const resultSheet = XLSX.utils.json_to_sheet(resultRows);
  autoSizeColumns(resultSheet, resultRows);
  XLSX.utils.book_append_sheet(workbook, resultSheet, 'Resultado');

  const summaryRows = Object.entries(summary || {}).map(([concepto, valor]) => ({ Concepto: concepto, Valor: valor }));
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  autoSizeColumns(summarySheet, summaryRows);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

  if (notFoundRows?.length) {
    const notFoundSheet = XLSX.utils.json_to_sheet(notFoundRows);
    autoSizeColumns(notFoundSheet, notFoundRows);
    XLSX.utils.book_append_sheet(workbook, notFoundSheet, 'No encontrados');
  }

  if (duplicateRows?.length) {
    const duplicateSheet = XLSX.utils.json_to_sheet(duplicateRows);
    autoSizeColumns(duplicateSheet, duplicateRows);
    XLSX.utils.book_append_sheet(workbook, duplicateSheet, 'Duplicados');
  }

  XLSX.writeFile(workbook, fileName);
}

function autoSizeColumns(sheet, rows) {
  const headers = Object.keys(rows?.[0] || {});
  sheet['!cols'] = headers.map((header) => {
    const maxLength = Math.max(
      String(header).length,
      ...rows.map((row) => String(row?.[header] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxLength + 2, 12), 45) };
  });
}
