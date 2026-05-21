export const DEFAULT_NORMALIZATION = {
  trimSpaces: true,
  removeInternalSpaces: false,
  ignoreCase: true,
  removeLeadingZeros: false,
  cleanInvisibleCharacters: true,
};

export function normalizeKey(value, options = DEFAULT_NORMALIZATION) {
  if (value === null || value === undefined) return '';

  let normalized = String(value);

  if (options.cleanInvisibleCharacters) {
    normalized = normalized.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');
  }

  if (options.trimSpaces) normalized = normalized.trim();
  if (options.removeInternalSpaces) normalized = normalized.replace(/\s+/g, '');
  if (options.ignoreCase) normalized = normalized.toLowerCase();
  if (options.removeLeadingZeros) normalized = normalized.replace(/^0+(?=\d)/, '');

  return normalized;
}

export function detectDuplicates(rows, keyColumn, normalizationOptions) {
  const map = new Map();

  rows.forEach((row, index) => {
    const normalizedKey = normalizeKey(row[keyColumn], normalizationOptions);
    if (!normalizedKey) return;

    if (!map.has(normalizedKey)) map.set(normalizedKey, []);
    map.get(normalizedKey).push({ index: index + 2, row, normalizedKey });
  });

  return Array.from(map.entries())
    .filter(([, matches]) => matches.length > 1)
    .flatMap(([key, matches]) =>
      matches.map((match) => ({
        Clave: key,
        FilaExcelAproximada: match.index,
        ...match.row,
      }))
    );
}

export function performJoin({
  rowsA,
  rowsB,
  keyA,
  keyB,
  selectedColumnsB,
  joinType = 'left',
  duplicateStrategy = 'first',
  normalizationOptions = DEFAULT_NORMALIZATION,
  notFoundValue = '',
  includeNormalizedKey = false,
  includeObservation = true,
}) {
  const indexB = buildIndex(rowsB, keyB, normalizationOptions);
  const usedBKeys = new Set();
  const resultRows = [];
  const notFoundRows = [];
  let matches = 0;
  let notFound = 0;

  rowsA.forEach((rowA) => {
    const normalizedKey = normalizeKey(rowA[keyA], normalizationOptions);
    const candidates = indexB.get(normalizedKey) || [];
    const hasMatch = Boolean(normalizedKey && candidates.length);

    if (!hasMatch) {
      notFound++;
      const output = buildOutputRow({
        rowA,
        rowB: null,
        selectedColumnsB,
        found: false,
        normalizedKey,
        notFoundValue,
        includeNormalizedKey,
        includeObservation,
        observation: normalizedKey ? 'Sin coincidencia en Archivo B' : 'Clave vacía en Archivo A',
      });
      notFoundRows.push(output);
      if (joinType === 'left' || joinType === 'full') resultRows.push(output);
      return;
    }

    matches++;
    usedBKeys.add(normalizedKey);
    const rowsToMerge = resolveDuplicateCandidates(candidates, duplicateStrategy);

    rowsToMerge.forEach((rowB, index) => {
      const output = buildOutputRow({
        rowA,
        rowB,
        selectedColumnsB,
        found: true,
        normalizedKey,
        notFoundValue,
        includeNormalizedKey,
        includeObservation,
        observation: candidates.length > 1 ? `Coincidencia duplicada en Archivo B (${index + 1}/${rowsToMerge.length})` : 'Coincidencia encontrada',
      });
      resultRows.push(output);
    });
  });

  if (joinType === 'full') {
    rowsB.forEach((rowB) => {
      const normalizedKey = normalizeKey(rowB[keyB], normalizationOptions);
      if (!normalizedKey || usedBKeys.has(normalizedKey)) return;

      const output = {
        Encontrado: 'Solo en Archivo B',
        ...(includeNormalizedKey ? { 'Clave normalizada': normalizedKey } : {}),
        ...(includeObservation ? { 'Observación del cruce': 'Registro existente solo en Archivo B' } : {}),
      };

      selectedColumnsB.forEach((column) => {
        output[`B_${column}`] = rowB[column] ?? '';
      });

      resultRows.push(output);
    });
  }

  const duplicateRows = detectDuplicates(rowsB, keyB, normalizationOptions);
  const summary = buildSummary({ rowsA, rowsB, matches, notFound, duplicateRows });

  return {
    resultRows,
    summary,
    notFoundRows,
    duplicateRows,
  };
}

function buildIndex(rows, keyColumn, normalizationOptions) {
  const index = new Map();

  rows.forEach((row) => {
    const normalizedKey = normalizeKey(row[keyColumn], normalizationOptions);
    if (!normalizedKey) return;
    if (!index.has(normalizedKey)) index.set(normalizedKey, []);
    index.get(normalizedKey).push(row);
  });

  return index;
}

function resolveDuplicateCandidates(candidates, duplicateStrategy) {
  if (duplicateStrategy === 'last') return [candidates[candidates.length - 1]];
  if (duplicateStrategy === 'concat') return [concatRows(candidates)];
  if (duplicateStrategy === 'mark') return candidates;
  return [candidates[0]];
}

function concatRows(rows) {
  const result = {};
  rows.forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      const current = result[key];
      const next = value ?? '';
      if (!current) result[key] = next;
      else if (String(current).split(' | ').includes(String(next))) return;
      else result[key] = `${current} | ${next}`;
    });
  });
  return result;
}

function buildOutputRow({ rowA, rowB, selectedColumnsB, found, normalizedKey, notFoundValue, includeNormalizedKey, includeObservation, observation }) {
  const output = { ...rowA };

  selectedColumnsB.forEach((column) => {
    const outputColumn = Object.prototype.hasOwnProperty.call(output, column) ? `B_${column}` : column;
    output[outputColumn] = found ? rowB?.[column] ?? '' : notFoundValue;
  });

  output.Encontrado = found ? 'Sí' : 'No';
  if (includeNormalizedKey) output['Clave normalizada'] = normalizedKey;
  if (includeObservation) output['Observación del cruce'] = observation;

  return output;
}

function buildSummary({ rowsA, rowsB, matches, notFound, duplicateRows }) {
  const totalA = rowsA.length;
  const percentage = totalA ? ((matches / totalA) * 100).toFixed(2) + '%' : '0%';

  return {
    'Filas Archivo A': totalA,
    'Filas Archivo B': rowsB.length,
    Coincidencias: matches,
    'No encontrados': notFound,
    'Duplicados detectados en Archivo B': duplicateRows.length,
    'Porcentaje de coincidencia': percentage,
  };
}
