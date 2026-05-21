import { exportToExcel } from '../utils/excel';

export default function ExportButton({ result }) {
  if (!result?.resultRows?.length) return null;

  return (
    <button
      className="primary large"
      type="button"
      onClick={() => exportToExcel(result)}
    >
      Descargar resultado_cruce.xlsx
    </button>
  );
}
