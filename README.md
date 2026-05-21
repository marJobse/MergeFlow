# Cruce Excel Profesional

Aplicación web client-side para cruzar dos archivos Excel o CSV por una columna clave y descargar un tercer Excel con el resultado.

## Objetivo

Resolver cruces administrativos, laborales, contables o de gestión sin depender de BUSCARV, XLOOKUP o Power Query.

Casos típicos:

- legajos
- empleados
- peritos
- viáticos
- movilidad
- subsidios
- pagos
- beneficiarios
- expedientes
- padrones

## Tecnologías

- React
- Vite
- JavaScript
- SheetJS / xlsx
- CSS moderno sin backend
- Compatible con Vercel

## Funcionalidades

- Subida de Archivo A y Archivo B
- Soporte `.xlsx`, `.xls` y `.csv`
- Selección de hoja en archivos con múltiples sheets
- Preview de datos
- Selección de columnas clave
- Selección de columnas del Archivo B a traer
- LEFT JOIN, INNER JOIN y FULL JOIN
- Normalización de claves
- Manejo de duplicados
- Resumen de control
- Exportación a Excel con hojas de resultado, resumen, no encontrados y duplicados

## Instalación

```bash
npm install
```

## Ejecución local

```bash
npm run dev
```

Luego abrir la URL local que indique Vite.

## Build

```bash
npm run build
```

## Deploy en Vercel

1. Subir el proyecto a GitHub.
2. Entrar a Vercel.
3. Crear un nuevo proyecto desde el repositorio.
4. Framework preset: Vite.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Deploy.

## Cómo probar

Podés crear dos archivos Excel simples:

Archivo A:

| legajo | nombre | area |
|---|---|---|
| 001 | Ana | Contabilidad |
| 002 | Bruno | Sistemas |
| 003 | Carla | Administración |

Archivo B:

| legajo | cargo | es_perito |
|---|---|---|
| 001 | Analista | Sí |
| 003 | Referente | Sí |

Configuración sugerida:

- Clave Archivo A: `legajo`
- Clave Archivo B: `legajo`
- Columnas a traer: `cargo`, `es_perito`
- Tipo de cruce: LEFT JOIN

Resultado esperado:

- Ana: encontrada
- Bruno: no encontrado
- Carla: encontrada

## Advertencias importantes sobre cruces Excel

Los errores más frecuentes no son del sistema sino de los datos:

- legajos como número en un archivo y texto en otro
- ceros a la izquierda perdidos
- espacios invisibles
- columnas con nombres parecidos pero no iguales
- duplicados en el archivo a cruzar
- hojas incorrectas seleccionadas
- filas vacías en el Excel original

Por eso la app incluye normalización y resumen de control.

## Mejoras futuras

- Guardar configuraciones frecuentes
- Historial local de cruces
- Filtros por resultado
- Comparación visual avanzada
- Soporte para más de dos archivos
- Validaciones por reglas de negocio
- Exportación con estilos más avanzados
