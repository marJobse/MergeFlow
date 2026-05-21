export default function PreviewTable({ title, rows, limit = 5 }) {
  if (!rows?.length) {
    return (
      <section className="card">
        <h3>{title}</h3>
        <p className="muted">Sin datos para mostrar.</p>
      </section>
    );
  }

  const previewRows = rows.slice(0, limit);
  const columns = Object.keys(previewRows[0] || {});

  return (
    <section className="card tableCard">
      <h3>{title}</h3>
      <p className="muted">Vista previa de {previewRows.length} filas sobre {rows.length}.</p>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {previewRows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => <td key={column}>{String(row[column] ?? '')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
