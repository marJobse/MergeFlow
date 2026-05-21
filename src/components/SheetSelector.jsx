export default function SheetSelector({ title, fileData, onSheetChange }) {
  if (!fileData) return null;

  return (
    <section className="card">
      <h3>{title}</h3>
      <label>
        Hoja a utilizar
        <select value={fileData.selectedSheetName} onChange={(event) => onSheetChange(event.target.value)}>
          {fileData.sheets.map((sheet) => (
            <option key={sheet.name} value={sheet.name}>
              {sheet.name} — {sheet.rows.length} filas
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
