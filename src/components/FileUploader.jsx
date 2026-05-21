import { validateInputFile } from '../utils/excel';

export default function FileUploader({ label, description, fileData, onFileLoaded, onClear, readFile }) {
  async function handleFile(file) {
    const validationError = validateInputFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const data = await readFile(file);
      onFileLoaded(data);
    } catch (error) {
      alert(error.message || 'No se pudo leer el archivo.');
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <section className="card uploader" onDrop={handleDrop} onDragOver={(event) => event.preventDefault()}>
      <div>
        <p className="eyebrow">{label}</p>
        <h3>{fileData?.fileName || 'Subí un archivo'}</h3>
        <p className="muted">{description}</p>
      </div>

      <label className="uploadBox">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(event) => event.target.files?.[0] && handleFile(event.target.files[0])}
        />
        <span>Arrastrá el archivo o hacé clic para seleccionarlo</span>
      </label>

      {fileData && (
        <button className="secondary" onClick={onClear} type="button">
          Limpiar archivo
        </button>
      )}
    </section>
  );
}
