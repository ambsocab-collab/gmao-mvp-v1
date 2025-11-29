# GMAO-MVP-V1 Guía de Diseño Visual y Wireframes

**Fecha:** 28 Noviembre 2025
**Diseñador:** Bernardo (AI Agent)
**Estilo:** Industrial UI (Alto Contraste, Touch-Friendly, Robust)

---

## 1. Identidad Visual & Tokens

Antes de definir las pantallas, establecemos el "ADN" visual de la aplicación para garantizar consistencia.

### Paleta de Colores (Tailwind Mapping)
*   **Superficies:**
    *   Fondo App: `bg-slate-50` (Gris muy claro, reduce fatiga visual vs blanco puro).
    *   Tarjetas/Paneles: `bg-white` + `shadow-sm` + `border-slate-200`.
    *   Cabeceras Oscuras: `bg-slate-900` (Texto `text-slate-50`).
*   **Acciones:**
    *   Primario: `bg-blue-600` -> `hover:bg-blue-700` (Botones Sólidos).
    *   Secundario: `bg-white` + `border-slate-300` (Botones Outline).
*   **Semántica (Feedback):**
    *   🔴 Error/Parada: `bg-red-100` + `text-red-700` (Borde `red-500`).
    *   🟡 Alerta/Espera: `bg-amber-50` + `text-amber-700` (Borde `amber-400`).
    *   🟢 Ok/En Curso: `bg-emerald-50` + `text-emerald-700` (Borde `emerald-500`).
    *   🟣 Gestión/N5: `bg-purple-50` + `text-purple-700` (Borde `purple-400`).

### Tipografía
*   **Fuentes:** Inter o Roboto (Sans-serif, legible).
*   **Escala:**
    *   `H1`: text-2xl font-bold (Títulos de Página).
    *   `H2`: text-lg font-semibold (Títulos de Tarjeta).
    *   `Body`: text-base (16px - Legibilidad estándar).
    *   `Label`: text-sm font-medium uppercase tracking-wide (Etiquetas).

---

## 2. Wireframes: Entorno Móvil (Operarios/Técnicos)

**Filosofía:** "Fat Finger Friendly". Botones de altura mínima 56px. Inputs grandes.

### 2.1 Pantalla de Inicio (Dashboard Móvil)
*Objetivo: Acceso inmediato a las 2 funciones críticas.*

```text
+-----------------------------------------------+
|  [=]  GMAO Ind.          (🔔 3)   (Perfil)    |  <-- Navbar Sticky + Notif.
+-----------------------------------------------+
|                                               |
|  Hola, Juan Pérez                             |
|  Operario L3                                  |
|                                               |
|  +-----------------------------------------+  |
|  |                                         |  |
|  |           REPORTAR AVERÍA               |  |
|  |              (ICONO ⚠️)                 |  |
|  |                                         |  |
|  +-----------------------------------------+  | <-- Button: h-32, bg-red-600
|                                               |
|  +-----------------------------------------+  |
|  |                                         |  |
|  |            MIS TAREAS (3)               |  |
|  |              (ICONO 📋)                 |  |
|  |                                         |  |
|  +-----------------------------------------+  | <-- Button: h-24, bg-blue-600
|                                               |
|  [ Buscar Activo / Repuesto...           🔍]  | <-- Input Search Large
|                                               |
+-----------------------------------------------+
|  (🏠 Inicio)  (📋 Tareas)  (🔔 Avisos)        |  <-- Bottom Nav Fixed
+-----------------------------------------------+
```

### 2.2 Reporte de Avería (Wizard Simplificado)
*Objetivo: Crear NL en segundos.*

```text
+-----------------------------------------------+
|  < Atrás    Nueva Incidencia                  |
+-----------------------------------------------+
|  1. ¿DÓNDE?                                   |
|  [ Buscar Máquina...                     🔍]  |
|                                               |
|  Últimas Usadas:                              |
|  [ 🏭 Extrusora A-01 ]  [ 🏭 Cinta 04 ]       | <-- Chips grandes
|                                               |
|  -------------------------------------------  |
|  2. ¿QUÉ PASA?                                |
|  [ 🔥 Olor a quemado ] [ 🛑 Parada total ]    | <-- Grid de 2 columnas
|  [ 🔊 Ruido extraño  ] [ 💧 Fuga liquido ]    |
|  [ ⌨️ Otro / Escribir...                   ]  |
|                                               |
|  -------------------------------------------  |
|  [ ENVIAR REPORTE AHORA                  🚀]  | <-- Bottom Fixed, Full Width
+-----------------------------------------------+
```

### 2.3 Mis Órdenes (Vista Técnico)
*Objetivo: Claridad en la siguiente tarea.*

```text
+-----------------------------------------------+
|  Mis Órdenes (3)                [Filtros]     |
+-----------------------------------------------+
|                                               |
|  [ PRIORIDAD ALTA 🔴 ]             #OT-1234   |
|  **Cambio Rodamiento Motor B**                |
|  🏭 Extrusora A-01                            |
|  💬 2 Comentarios (Ver Bitácora)              |  <-- Indicador de Chat
|  🕒 Asignado: 08:00 AM                        |
|  +-----------------------------------------+  |
|  | ▶️ INICIAR TRABAJO                      |  |
|  +-----------------------------------------+  |
|                                               |
|  -------------------------------------------  |
|                                               |
|  [ PREVENTIVO 🟢 ]                 #OT-1239   |
|  **Revisión Mensual Niveles**                 |
|  🏭 Compresor Sala 2                          |
|  📅 Para: Hoy                                 |
|                                               |
+-----------------------------------------------+
```

---

## 3. Wireframes: Entorno Escritorio (Gestión)

**Filosofía:** Densidad de información controlada. Paneles laterales para no perder contexto.

### 3.1 Canvas de Planificación (Kanban)
*Objetivo: Visión global del estado de la planta.*

```text
+-------------------------------------------------------------------------------+
| GMAO | 📊 Dash | 📋 Canvas | 🏭 Activos | 📦 Stock | ⚙️ Config      (User v)|
+-------------------------------------------------------------------------------+
| Filtros: [👨‍🔧 Todos] [🏭 Todas Líneas] [🔍 Buscar OT...]          [+ NUEVA OT]|
+-------------------------------------------------------------------------------+
|                                                                               |
|  PENDIENTES (5)      |  ASIGNADAS (3)       |  EN PROGRESO (2) |  EXTERNO N5 |
|                      |                      |                  |             |
| +------------------+ | +------------------+ | +--------------+ | +---------+ |
| |🔴 #OT-1240       | | |🟢 #OT-1239       | | |🔴 #OT-1234   | | |🟣 #OT-99| |
| | Fuga Aceite      | | | Rev. Niveles     | | | Rodamiento B | | | Calibra.| |
| | 🏭 Prensa 01     | | | 👨‍🔧 Juan Pérez    | | | 👨‍🔧 Ana G.    | | | 🏢 Siemens| |
| | ⚠️ Sin Stock     | | | 📅 Hoy 10:00     | | | ⏱️ 01:30h    | | | 📅 Vie  | |
| +------------------+ | +------------------+ | +--------------+ | +---------+ |
|                      |                      |                  |             |
| +------------------+ |                      |                  |             |
| |🟡 #OT-1241       | |                      |                  |             |
| | Ruido Cinta      | |                      |                  |             |
| | 🏭 Cinta 02      | |                      |                  |             |
| +------------------+ |                      |                  |             |
|                      |                      |                  |             |
+-------------------------------------------------------------------------------+
```

### 3.2 Detalle de Activo + Historial (Split View)
*Objetivo: Diagnóstico rápido.*

```text
+----------------------+--------------------------------------------------------+
| 🏭 ÁRBOL ACTIVOS     |  🏭 Extrusora A-01  (Activa 🟢)                        |
+----------------------+--------------------------------------------------------+
| > Planta Principal   |  [Editar] [Nueva OT] [Ver Documentos] [Ver Calendario] |
|   v Línea Extrusión  |                                                        |
|     > Extrusora A-01 |  +----------------+  +------------------------------+  |
|     > Cinta 04       |  | DATOS TÉCNICOS |  | ÚLTIMAS INTERVENCIONES       |  |
|   > Embalaje         |  | Modelo: XT-500 |  | ---------------------------- |  |
|                      |  | Serie: 998877  |  | ✅ 27/11 - Ajuste (J.Pérez)  |  |
|                      |  | Fab: 2020      |  | ✅ 15/11 - Preventivo A      |  |
|                      |  | Ubic: Nave B   |  | 🔴 01/11 - Rotura Eje        |  |
|                      |  +----------------+  +------------------------------+  |
|                      |                                                        |
|                      |  +--------------------------------------------------+  |
|                      |  | REPUESTOS CRÍTICOS ASOCIADOS                     |  |
|                      |  | ⚙️ Rodamiento 6204 (Stock: 5 ✅)                 |  |
|                      |  | 🔌 Sensor Temp J-Type (Stock: 0 ⚠️)              |  |
|                      |  +--------------------------------------------------+  |
+----------------------+--------------------------------------------------------+
```

---

## 4. Wireframes: Gestión de Stock y N5

### 4.1 Recepción de Material (Desktop/Tablet)
*Objetivo: Entrada rápida de mercancía.*

```text
+-----------------------------------------------------------+
|  📦 RECEPCIÓN DE MATERIAL                                 |
+-----------------------------------------------------------+
|  BUSCAR REPUESTO:                                         |
|  [ Ref: 6204_________ ] [ BUSCAR ]                        |
|                                                           |
|  RESULTADO:                                               |
|  **Rodamiento SKF 6204-2Z**                               |
|  Stock Actual: 12 unidades                                |
|                                                           |
|  +-----------------------------------------------------+  |
|  |  UBICACIÓN SUGERIDA: Pasillo A / Estante 3 / Caja 2 |  |
|  +-----------------------------------------------------+  |
|                                                           |
|  CANTIDAD A INGRESAR:  [  10  ] u.                        |
|  REFERENCIA ALBARÁN:   [ ALB-2025-001 ]                   |
|                                                           |
|  [ CONFIRMAR ENTRADA Y ACTUALIZAR STOCK ]                 |
+-----------------------------------------------------------+
```

### 4.2 Asignación a Externo N5 (Modal en Canvas)
*Objetivo: Derivar trabajo a proveedor.*

```text
+-----------------------------------------------------------+
|  ASIGNAR ORDEN #OT-1250                                   |
+-----------------------------------------------------------+
|  Tipo de Asignación:                                      |
|  ( ) Técnico Interno                                      |
|  (•) Empresa Externa (N5)                                 |
|                                                           |
|  Seleccionar Proveedor:                                   |
|  [ Siemens Industrial Services (Elec) | v ]               |
|                                                           |
|  Contacto Principal: Carlos Ing. (666-555-444)            |
|                                                           |
|  Nota para el proveedor:                                  |
|  [ Revisar calibración del sensor de carga...           ] |
|                                                           |
|  [ ASIGNAR Y MOVER A COLUMNA 'EXTERNO' ] [ Cancelar ]     |
+-----------------------------------------------------------+
```

### 4.3 Ajuste de Stock / Regularización (Modal)
*Objetivo: Corrección rápida de inventario físico vs sistema.*

```text
+-----------------------------------------------------------+
|  ⚠️ REGULARIZACIÓN DE STOCK                               |
+-----------------------------------------------------------+
|  REPUESTO: Rodamiento SKF 6204-2Z                         |
|  UBICACIÓN: Pasillo A / Estante 3                         |
|                                                           |
|  STOCK EN SISTEMA:  [ 12 ] u.                             |
|                                                           |
|  -------------------------------------------------------  |
|                                                           |
|  STOCK REAL CONTEADO:                                     |
|  [   10   ] u.                                            |
|                                                           |
|  MOTIVO DEL AJUSTE:                                       |
|  [ Rotura / Merma           | v ]                         |
|    - Rotura / Merma                                       |
|    - Conteo Cíclico (Inventario)                          |
|    - Pérdida Desconocida                                  |
|    - Error Administrativo                                 |
|                                                           |
|  OBSERVACIONES:                                           |
|  [ Se encontraron 2 cajas vacías al fondo...            ] |
|                                                           |
|  [ CONFIRMAR AJUSTE (-2 u.) ]    [ Cancelar ]             |
+-----------------------------------------------------------+
```

### 4.4 Gestión de Compras (Necesidades -> OC)
*Objetivo: Convertir alertas de stock en pedidos.*

```text
+-------------------------------------------------------------------------------+
|  🛒 NECESIDADES DE COMPRA Y REAPROVISIONAMIENTO                               |
+-------------------------------------------------------------------------------+
|  FILTROS: [⚠️ Bajo Mínimo (12)] [👤 Solicitud Manual (3)] [ Proveedor: SKF ]  |
|                                                                               |
|  SELECCIONAR ÍTEMS PARA ORDEN:                                                |
|  [x] ⚙️ Rodamiento 6204   (Stock: 1 | Mín: 5)   -> Pedir: [ 10 ] u.           |
|  [x] ⚙️ Rodamiento 6205   (Stock: 0 | Mín: 2)   -> Pedir: [  5 ] u.           |
|  [ ] 🔌 Sensor Inductivo  (Stock: 1 | Mín: 2)   -> Pedir: [  2 ] u.           |
|  [x] 🛠️ Llave Inglesa     (Solicitado por Juan) -> Pedir: [  1 ] u.           |
|                                                                               |
|  ---------------------------------------------------------------------------  |
|  RESUMEN DE ORDEN:                                                            |
|  Ítems: 3 | Proveedor Sugerido: Suministros Ind. | Coste Est: 150€            |
|                                                                               |
|  [ GENERAR ORDEN DE COMPRA (OC) ]                                             |
+-------------------------------------------------------------------------------+
```

---

## 6. Admin Panel (Gestión Avanzada)

### 6.1 User Permissions (Gestión Granular)
*Objetivo: Control total sobre qué puede hacer cada usuario.*

```text
+-----------------------------------------------------------+
|  👤 EDICIÓN DE USUARIO: Juan Pérez (Técnico)              |
+-----------------------------------------------------------+
|  DATOS GENERALES:                                         |
|  Email: juan.perez@planta.com                             |
|  Rol Base: [ Técnico      | v ]                           |
|  Nivel Capacidad: [ N3 - Oficial 1ª | v ]                 |
|                                                           |
|  PERMISOS ESPECÍFICOS (Overrides):                        |
|  -------------------------------------------------------  |
|  [x] Acceso Móvil (TWA)                                   |
|  [x] Crear OTs Directas (Preventivo/Mejora)               |
|  [ ] Regularización de Stock (Ajuste Manual)   <-- OFF    |
|  [x] Solicitar Compra de Repuesto                         |
|  [ ] Validar Trabajos Externos                            |
|                                                           |
|  [ GUARDAR CAMBIOS ]    [ Resetear a Defaults del Rol ]   |
+-----------------------------------------------------------+
```

### 6.2 Data Import (Carga Masiva)
*Objetivo: Herramienta de Admin para gestión masiva de datos.*

```text
+-----------------------------------------------------------+
|  📊 DATA IMPORT / CARGA MASIVA                            |
+-----------------------------------------------------------+
|  Seleccionar Tipo de Datos a Importar:                    |
|  (•) Activos (Instalaciones)                              |
|  ( ) Repuestos (Inventario)                               |
|                                                           |
|  -------------------------------------------------------  |
|  1. DESCARGAR PLANTILLA:                                  |
|     [ Descargar Plantilla Activos (.xlsx) ]               |
|     (Incluye la estructura necesaria para Activos)        |
|                                                           |
|  -------------------------------------------------------  |
|  2. SUBIR ARCHIVO:                                        |
|     [ Seleccionar Archivo (.xlsx/.csv)   ] [ Subir ]      |
|     (El archivo debe seguir la estructura de la plantilla)|
|                                                           |
|  -------------------------------------------------------  |
|  [ VER HISTORIAL DE IMPORTACIONES ANTERIORES ]            |
|                                                           |
+-----------------------------------------------------------+
```

---

## 7. Analytics & Factory View

### 7.1 TV Mode / Kiosk View (Pantalla de Planta)
*Objetivo: Visualización pasiva a distancia (High Contrast, Dark Mode).*

```text
+-------------------------------------------------------------------------------+
|  GMAO PLANTA GENERAL          [⏺️ LIVE] 10:42 AM           (Rotación: 25s)    |
+-------------------------------------------------------------------------------+
|                                                                               |
|  +-----------------------+   +-----------------------+   +------------------+ |
|  | MTBF (Fiabilidad)     |   | MTTR (Respuesta)      |   | DISPONIBILIDAD   | |
|  | 142h                  |   | 45m                   |   | 98.5%            | |
|  | 🟢 +12% vs mes ant.   |   | 🔴 +5m vs obj.        |   | 🟢 OBJ: 98%      | |
|  +-----------------------+   +-----------------------+   +------------------+ |
|                                                                               |
|  +--------------------------------------------------------------------------+ |
|  |  TOP 5 AVERÍAS (PARETO) - ESTE MES                                       | |
|  +--------------------------------------------------------------------------+ |
|  |                                                                          | |
|  |  ████████████████████  Fallo Sensor Temp (12)                            | |
|  |  ██████████████        Atasco Cinta 04 (8)                               | |
|  |  ████████              Fuga Hidráulica (5)                               | |
|  |  ████                  Desalineación (2)                                 | |
|  |                                                                          | |
|  +--------------------------------------------------------------------------+ |
|                                                                               |
|  +-------------------------------------------------------+ +----------------+ |
|  | ESTADO ACTUAL DE PLANTA                               | | AVISOS         | |
|  | 🏭 Línea 1: [🟢 OK]   🏭 Línea 2: [🔴 PARADA]         | | ⚠️ Revisión    | |
|  | 🏭 Calderas: [🟢 OK]  🏭 Compresores: [🟡 ALERTA]     | |    Anual 15/12 | |
|  +-------------------------------------------------------+ +----------------+ |
+-------------------------------------------------------------------------------+
```

---

## 8. Interacciones Clave

1.  **Drag & Drop en Canvas:**
    *   Al coger una tarjeta, las columnas válidas se resaltan (borde azul discontinuo).
    *   Al soltar en "Externo", se abre automáticamente el modal de "Asignación a Externo".

2.  **Buscador Predictivo (Móvil):**
    *   Al escribir 3 caracteres, despliega lista flotante.
    *   Prioriza activos con OTs recientes o asignados al usuario.

3.  **Validación de Stock:**
    *   En la OT, al añadir un repuesto, si `cantidad_necesaria > stock_actual`, el input se pone rojo y muestra alerta: "Stock insuficiente. ¿Crear solicitud de compra?".

---

Este documento define la estructura visual y debe usarse junto con `ux-design-specification.md` para la implementación.
