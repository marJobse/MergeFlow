import { useMemo, useState } from 'react';
import FileUploader from './components/FileUploader.jsx';
import SheetSelector from './components/SheetSelector.jsx';
import ColumnSelector from './components/ColumnSelector.jsx';
import JoinConfig from './components/JoinConfig.jsx';
import PreviewTable from './components/PreviewTable.jsx';
import ResultSummary from './components/ResultSummary.jsx';
import ExportButton from './components/ExportButton.jsx';
import { getSelectedSheet, readExcelFile } from './utils/excel.js';
import { DEFAULT_NORMALIZATION, performJoin } from './utils/join.js';

const INITIAL_CONFIG = {
  keyA: '',
  keyB: '',
  selectedColumnsB: [],
  joinType: 'left',
  duplicateStrategy: 'first',
  normalizationOptions: DEFAULT_NORMALIZATION,
  notFoundValue: '',
  includeNormalizedKey: false,
};

export default function App() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [result, setResult] = useState(null);

  const sheetA = useMemo(() => getSelectedSheet(fileA), [fileA]);
  const sheetB = useMemo(() => getSelectedSheet(fileB), [fileB]);

  function updateSheet(which, selectedSheetName) {
    const setter = which === 'A' ? setFileA : setFileB;
    const current = which === 'A' ? fileA : fileB;
    setter({ ...current, selectedSheetName });
    setResult(null);
  }

  function processJoin() {
    if (!sheetA?.rows?.length || !sheetB?.rows?.length) {
      alert('Primero cargá ambos archivos con datos válidos.');
      return;
    }

    if (!config.keyA || !config.keyB) {
      alert('Seleccioná las columnas clave de ambos archivos.');
      return;
    }

    if (!config.selectedColumnsB.length && config.joinType !== 'full') {
      alert('Seleccioná al menos una columna del Archivo B para traer al resultado.');
      return;
    }

    const joinResult = performJoin({
      rowsA: sheetA.rows,
      rowsB: sheetB.rows,
      keyA: config.keyA,
      keyB: config.keyB,
      selectedColumnsB: config.selectedColumnsB,
      joinType: config.joinType,
      duplicateStrategy: config.duplicateStrategy,
      normalizationOptions: config.normalizationOptions,
      notFoundValue: config.notFoundValue,
      includeNormalizedKey: config.includeNormalizedKey,
      includeObservation: true,
    });

    setResult(joinResult);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  function resetAll() {
    setFileA(null);
    setFileB(null);
    setConfig(INITIAL_CONFIG);
    setResult(null);
  }

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Herramienta client-side</p>
        <h1>Cruce profesional de archivos Excel / CSV</h1>
        <p>
          Subí dos listados, elegí las columnas clave, configurá la normalización y descargá un Excel final con resumen, no encontrados y duplicados.
        </p>
      </header>

      <section className="steps">
        <span>1. Archivos</span>
        <span>2. Hojas</span>
        <span>3. Columnas</span>
        <span>4. Cruce</span>
        <span>5. Descarga</span>
      </section>

      <div className="grid two">
        <FileUploader
          label="Archivo A"
          description="Listado base. Es el archivo principal que se conserva en el resultado."
          fileData={fileA}
          readFile={readExcelFile}
          onFileLoaded={(data) => { setFileA(data); setResult(null); }}
          onClear={() => { setFileA(null); setResult(null); }}
        />
        <FileUploader
          label="Archivo B"
          description="Listado de referencia. De acá se buscan coincidencias y se traen datos adicionales."
          fileData={fileB}
          readFile={readExcelFile}
          onFileLoaded={(data) => { setFileB(data); setResult(null); }}
          onClear={() => { setFileB(null); setResult(null); }}
        />
      </div>

      <div className="grid two">
        <SheetSelector title="Hoja Archivo A" fileData={fileA} onSheetChange={(name) => updateSheet('A', name)} />
        <SheetSelector title="Hoja Archivo B" fileData={fileB} onSheetChange={(name) => updateSheet('B', name)} />
      </div>

      <div className="grid two">
        {sheetA && <PreviewTable title="Preview Archivo A" rows={sheetA.rows} />}
        {sheetB && <PreviewTable title="Preview Archivo B" rows={sheetB.rows} />}
      </div>

      <ColumnSelector
        columnsA={sheetA?.columns || []}
        columnsB={sheetB?.columns || []}
        config={config}
        setConfig={(nextConfig) => { setConfig(nextConfig); setResult(null); }}
      />

      {sheetA && sheetB && <JoinConfig config={config} setConfig={(nextConfig) => { setConfig(nextConfig); setResult(null); }} />}

      {sheetA && sheetB && (
        <section className="actions">
          <button className="primary" onClick={processJoin} type="button">Procesar cruce</button>
          <button className="secondary" onClick={resetAll} type="button">Reiniciar</button>
        </section>
      )}

      <ResultSummary summary={result?.summary} />
      {result?.resultRows?.length ? <PreviewTable title="Preview del resultado" rows={result.resultRows} limit={10} /> : null}
      <section className="actions"><ExportButton result={result} /></section>
    </main>
  );
}
