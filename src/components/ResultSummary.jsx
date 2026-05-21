export default function ResultSummary({ summary }) {
  if (!summary) return null;

  return (
    <section className="card wide summary">
      <h3>Resumen de control</h3>
      <div className="summaryGrid">
        {Object.entries(summary).map(([key, value]) => (
          <div className="summaryItem" key={key}>
            <span>{key}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
