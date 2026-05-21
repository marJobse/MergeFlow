import { useMemo, useState } from "react";
import FileUploader from "./components/FileUploader.jsx";
import SheetSelector from "./components/SheetSelector.jsx";
import ColumnSelector from "./components/ColumnSelector.jsx";
import JoinConfig from "./components/JoinConfig.jsx";
import PreviewTable from "./components/PreviewTable.jsx";
import ResultSummary from "./components/ResultSummary.jsx";
import ExportButton from "./components/ExportButton.jsx";
import { getSelectedSheet, readExcelFile } from "./utils/excel.js";
import { DEFAULT_NORMALIZATION, performJoin } from "./utils/join.js";

const INITIAL_CONFIG = {
  keyA: "",
  keyB: "",
  selectedColumnsB: [],
  joinType: "left",
  duplicateStrategy: "first",
  normalizationOptions: DEFAULT_NORMALIZATION,
  notFoundValue: "",
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
    const setter = which === "A" ? setFileA : setFileB;
    const current = which === "A" ? fileA : fileB;
    setter({ ...current, selectedSheetName });
    setResult(null);
  }

  function updateConfig(nextConfig) {
    setConfig(nextConfig);
    setResult(null);
  }

  function processJoin() {
    if (!sheetA?.rows?.length || !sheetB?.rows?.length) {
      alert("Primero cargá ambos archivos con datos válidos.");
      return;
    }

    if (!config.keyA || !config.keyB) {
      alert("Seleccioná las columnas clave de ambos archivos.");
      return;
    }

    if (!config.selectedColumnsB.length && config.joinType !== "full") {
      alert(
        "Seleccioná al menos una columna del Archivo B para traer al resultado."
      );
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
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
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
        <p className="eyebrow">MergeFlow</p>
        <h1>Conciliación Inteligente de Datos</h1>
      </header>

      <section className="workflow-card">
        <div className="workflow-header">
          <p className="eyebrow">Flujo de trabajo</p>
          <h2>Cómo se realiza el proceso</h2>
          <p>
            La herramienta conserva el listado base, busca coincidencias en el
            listado de cruce y genera un Excel final con la información
            incorporada.
          </p>
        </div>

        <div className="workflow-step">
          <span className="workflow-number">1</span>
          <div>
            <h3>Importar</h3>
            <p>Subís el archivo BASE y el archivo CRUCE.</p>
          </div>
        </div>

        <div className="workflow-step">
          <span className="workflow-number">2</span>
          <div>
            <h3>Revisar</h3>
            <p>
              Elegís las hojas y verificás que los datos se hayan leído
              correctamente.
            </p>
          </div>
        </div>

        <div className="workflow-step">
          <span className="workflow-number">3</span>
          <div>
            <h3>Configurar</h3>
            <p>Elegís columnas clave, datos a traer y reglas de comparación.</p>
          </div>
        </div>

        <div className="workflow-step">
          <span className="workflow-number">4</span>
          <div>
            <h3>Procesar</h3>
            <p>
              El sistema cruza los datos y genera el Excel final para descargar.
            </p>
          </div>
        </div>
        <div className="workflow-step">
          <span className="workflow-number">4</span>
          <div>
            <h3>Exportar</h3>
            <p>Se descarga el excel.</p>
          </div>
        </div>
      </section>

      <section className="step-section">
        <div className="step-title">
          <span className="step-badge">Paso 1 de 5</span>
          <h2>Importar archivos</h2>
          <p>
            Subí el listado BASE y el listado CRUCE. El BASE se conserva como
            listado principal, y el CRUCE aporta la información adicional.
          </p>
        </div>

        <div className="grid two">
          <FileUploader
            label="Archivo A"
            description="Listado BASE"
            fileData={fileA}
            readFile={readExcelFile}
            onFileLoaded={(data) => {
              setFileA(data);
              setResult(null);
            }}
            onClear={() => {
              setFileA(null);
              setResult(null);
            }}
          />

          <FileUploader
            label="Archivo B"
            description="Listado CRUCE"
            fileData={fileB}
            readFile={readExcelFile}
            onFileLoaded={(data) => {
              setFileB(data);
              setResult(null);
            }}
            onClear={() => {
              setFileB(null);
              setResult(null);
            }}
          />
        </div>
      </section>

      {(fileA || fileB) && (
        <section className="step-section">
          <div className="step-title">
            <span className="step-badge">Paso 2 de 5</span>
            <h2>Seleccionar hojas y revisar datos</h2>
            <p>
              Si el archivo tiene varias hojas, elegí cuál usar. Luego revisá
              una vista previa para confirmar que los datos se leyeron bien.
            </p>
          </div>

          <div className="grid two">
            <SheetSelector
              title="Hoja Archivo A"
              fileData={fileA}
              onSheetChange={(name) => updateSheet("A", name)}
            />

            <SheetSelector
              title="Hoja Archivo B"
              fileData={fileB}
              onSheetChange={(name) => updateSheet("B", name)}
            />
          </div>

          <div className="grid two">
            {sheetA && (
              <PreviewTable title="Preview Archivo A" rows={sheetA.rows} />
            )}

            {sheetB && (
              <PreviewTable title="Preview Archivo B" rows={sheetB.rows} />
            )}
          </div>
        </section>
      )}

      {sheetA && sheetB && (
        <section className="config-panel">
          <div className="config-panel-header">
            <span className="step-badge">Paso 3 de 5</span>
            <h2>Configurar cruce</h2>
            <p>
              Este paso tiene dos partes: primero elegís las columnas que
              identifican cada registro y qué información querés traer; después
              definís cómo debe comportarse la comparación.
            </p>
          </div>

          <div className="config-substep">
            <div className="substep-marker">3.1</div>

            <div className="substep-content">
              <ColumnSelector
                columnsA={sheetA?.columns || []}
                columnsB={sheetB?.columns || []}
                config={config}
                setConfig={updateConfig}
              />
            </div>
          </div>

          <div className="config-substep">
            <div className="substep-marker">3.2</div>

            <div className="substep-content">
              <JoinConfig config={config} setConfig={updateConfig} />
            </div>
          </div>
        </section>
      )}

      {sheetA && sheetB && (
        <section className="step-section">
          <div className="step-title">
            <span className="step-badge">Paso 4 de 5</span>
            <h2>Procesar</h2>
            <p>Ejecutá el cruce y revisá el resumen de control</p>
          </div>

          <section className="actions">
            <button className="primary" onClick={processJoin} type="button">
              Procesar cruce
            </button>

            <button className="secondary" onClick={resetAll} type="button">
              Reiniciar
            </button>
          </section>

          <ResultSummary summary={result?.summary} />

          {result?.resultRows?.length ? (
            <PreviewTable
              title="Preview del resultado"
              rows={result.resultRows}
              limit={10}
            />
          ) : null}
        </section>
      )}
      <br />
      {sheetA && sheetB && (
        <section className="step-section">
          <div className="step-title">
            <span className="step-badge">Paso 5 de 5</span>
            <h2>Exportar</h2>
            <p>Descarga el archivo procesado.</p>
          </div>

          <section className="actions">
            <ExportButton result={result} />
          </section>
        </section>
      )}
    </main>
  );
}
