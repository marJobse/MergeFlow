const resultTypeHelp = {
  left: 'Recomendado: conserva todo el Archivo A y agrega datos del Archivo B cuando encuentra coincidencias.',
  inner: 'Solo deja en el resultado los registros que aparecen en ambos archivos.',
  full: 'Incluye los registros del Archivo A y también los que existan solamente en el Archivo B.',
};

const duplicateHelp = {
  first: 'Usa la primera fila encontrada en el Archivo B para cada clave repetida.',
  last: 'Usa la última fila encontrada en el Archivo B para cada clave repetida.',
  concat: 'Une los valores repetidos en una misma celda separados por una barra.',
  mark: 'Muestra todas las coincidencias y agrega una observación de duplicado.',
};

export default function JoinConfig({ config, setConfig }) {
  function setNormalization(key, value) {
    setConfig({
      ...config,
      normalizationOptions: {
        ...config.normalizationOptions,
        [key]: value,
      },
    });
  }

  return (
    <section className="card wide join-config">
      <h3>Normalización y comportamiento del cruce</h3>
      <p className="muted section-intro">
        Estas opciones definen qué registros conservar, qué hacer si hay varias coincidencias y cómo corregir diferencias comunes de formato.
      </p>

      <div className="grid three">
        <label>
          Qué registros querés conservar
          <select value={config.joinType} onChange={(event) => setConfig({ ...config, joinType: event.target.value })}>
            <option value="left">Mantener todo el listado BASE</option>
            <option value="inner">Mostrar solo registros con coincidencia</option>
            <option value="full">Unir ambos listados completos</option>
          </select>
          <small className="field-help">{resultTypeHelp[config.joinType]}</small>
        </label>

        <label>
          Si existen varias coincidencias
          <select value={config.duplicateStrategy} onChange={(event) => setConfig({ ...config, duplicateStrategy: event.target.value })}>
            <option value="first">Usar la primera coincidencia encontrada</option>
            <option value="last">Usar la última coincidencia encontrada</option>
            <option value="concat">Unir todas las coincidencias</option>
            <option value="mark">Mostrar todas y marcar duplicados</option>
          </select>
          <small className="field-help">{duplicateHelp[config.duplicateStrategy]}</small>
        </label>

        <label>
          Cuando no encuentre coincidencia
          <input
            value={config.notFoundValue}
            onChange={(event) => setConfig({ ...config, notFoundValue: event.target.value })}
            placeholder="Vacío o No encontrado"
          />
          <small className="field-help">Texto que se completará en las columnas traídas desde el Archivo B.</small>
        </label>
      </div>

      <div className="checks-title">
        Correcciones automáticas para comparar mejor
      </div>

      <div className="checks compact">
        <label className="check">
          <input type="checkbox" checked={config.normalizationOptions.trimSpaces} onChange={(e) => setNormalization('trimSpaces', e.target.checked)} />
          Ignorar espacios innecesarios
        </label>

        <label className="check">
          <input type="checkbox" checked={config.normalizationOptions.removeInternalSpaces} onChange={(e) => setNormalization('removeInternalSpaces', e.target.checked)} />
          Ignorar espacios internos también
        </label>

        <label className="check">
          <input type="checkbox" checked={config.normalizationOptions.ignoreCase} onChange={(e) => setNormalization('ignoreCase', e.target.checked)} />
          Considerar iguales MAYÚSCULAS y minúsculas
        </label>

        <label className="check">
          <input type="checkbox" checked={config.normalizationOptions.removeLeadingZeros} onChange={(e) => setNormalization('removeLeadingZeros', e.target.checked)} />
          Tratar 000123 y 123 como iguales
        </label>

        <label className="check">
          <input type="checkbox" checked={config.normalizationOptions.cleanInvisibleCharacters} onChange={(e) => setNormalization('cleanInvisibleCharacters', e.target.checked)} />
          Corregir errores comunes de formato
        </label>

        <label className="check">
          <input type="checkbox" checked={config.includeNormalizedKey} onChange={(e) => setConfig({ ...config, includeNormalizedKey: e.target.checked })} />
          Agregar columna de control con la clave comparada
        </label>
      </div>
    </section>
  );
}
