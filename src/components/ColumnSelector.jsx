export default function ColumnSelector({ columnsA, columnsB, config, setConfig }) {
  if (!columnsA?.length || !columnsB?.length) return null;

  function toggleColumn(column) {
    const exists = config.selectedColumnsB.includes(column);
    setConfig({
      ...config,
      selectedColumnsB: exists
        ? config.selectedColumnsB.filter((item) => item !== column)
        : [...config.selectedColumnsB, column],
    });
  }

  return (
    <section className="card wide">
      <h3>Configuración del cruce</h3>
      <div className="grid two">
        <label>
          Columna clave del Archivo A
          <select value={config.keyA} onChange={(event) => setConfig({ ...config, keyA: event.target.value })}>
            <option value="">Seleccionar</option>
            {columnsA.map((column) => <option key={column} value={column}>{column}</option>)}
          </select>
        </label>

        <label>
          Columna clave del Archivo B
          <select value={config.keyB} onChange={(event) => setConfig({ ...config, keyB: event.target.value })}>
            <option value="">Seleccionar</option>
            {columnsB.map((column) => <option key={column} value={column}>{column}</option>)}
          </select>
        </label>
      </div>

      <div className="columnPicker">
        <p>Columnas del Archivo B a traer</p>
        <div className="checks">
          {columnsB.map((column) => (
            <label key={column} className="check">
              <input
                type="checkbox"
                checked={config.selectedColumnsB.includes(column)}
                onChange={() => toggleColumn(column)}
              />
              {column}
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
