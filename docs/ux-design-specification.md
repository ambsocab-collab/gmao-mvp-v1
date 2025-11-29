# GMAO-MVP-V1 Especificación de Diseño UX

_Creado el: 2025-11-28 por Bernardo_
_Generado usando: Método BMad - Flujo de Diseño UX v1.0_

---

## Executive Summary (Resumen Ejecutivo)

El GMAO (Gestión de Mantenimiento Asistido por Ordenador) es una plataforma integral diseñada para transformar la operativa de mantenimiento en plantas industriales. El objetivo principal es digitalizar el flujo de trabajo desde la detección de averías por operarios hasta la validación técnica, eliminando el papel y optimizando los tiempos de respuesta.

La visión del producto se centra en:
- **Simplicidad Operativa:** Interfaces "a prueba de guantes" para operarios.
- **Colaboración Visual:** Un Canvas digital que reemplaza la pizarra física.
- **Gestión Inteligente:** Asignación basada en capacidades (Niveles N1-N5) y gestión flexible de activos.

---

## 1. Design System Foundation (Cimientos del Sistema de Diseño)

### 1.1 Design System Choice
**Sistema Elegido:** Industrial UI System (Basado en **Tailwind CSS** + **Shadcn/UI**)

**Racionalización:**
Se ha seleccionado una arquitectura basada en componentes modulares que prioriza la accesibilidad y la claridad en entornos industriales.
- **Tailwind CSS:** Permite una personalización rápida para cumplir con los requisitos de alto contraste y espaciado adaptable (NFR7).
- **Shadcn/UI:** Proporciona componentes accesibles y robustos que funcionan bien tanto en entornos de escritorio (gestión) como móviles (operarios).
- **Enfoque Industrial:** Se prioriza la legibilidad sobre la estética decorativa. Botones grandes (>44px), tipografía clara y retroalimentación visual inmediata.

---

## 2. Core User Experience (Experiencia de Usuario Principal)

### 2.1 Defining Experience
La experiencia se define por tres pilares fundamentales alineados con el PRD:

1.  **El Flujo Reactivo (Operario):** "Detectar y Disparar". El operario debe poder reportar una incidencia en menos de 5 toques (Success Criteria 1). La interfaz es limpia, enfocada en una sola tarea a la vez.
2.  **El Canvas de Planificación (Supervisor/Técnico):** Una experiencia de escritorio rica ("Drag & Drop") que simula un tablero Kanban físico. Permite mover tarjetas (OTs) entre técnicos y estados con retroalimentación inmediata (NFR2).
3.  **Ejecución Guiada (Técnico):** Una vista móvil enfocada en la tarea actual ("Mi Trabajo"), con temporizadores, acceso rápido a manuales y flujo de solicitud de repuestos simplificado.

### 2.2 Novel UX Patterns
- **Asignación por Capacidad (Skill-Based Routing):** Visualización de técnicos no solo por disponibilidad, sino por nivel de capacitación (N1-N5) mediante indicadores visuales (badges/iconos) en el Canvas.
- **Semáforos de Estado de Activo:** Indicadores visuales en la jerarquía de activos que muestran el estado de salud en tiempo real (basado en OTs abiertas).

---

## 3. Visual Foundation (Fundamentos Visuales)

### 3.1 Color System
El sistema de color sigue normas de seguridad industrial y claridad semántica.

- **Primarios:**
    - `Slate-900`: Textos principales y elementos de navegación (Profesionalidad, robustez).
    - `Blue-600`: Acciones principales (Botones, Enlaces).
- **Semánticos (Estado):**
    - `Red-600` (Error/Parada): Averías críticas, Stock agotado.
    - `Amber-500` (Advertencia): Stock bajo mínimo, Pendiente de validación.
    - `Green-600` (Éxito/Operativo): OT cerrada, Activo funcionando.
    - `Purple-600` (Gestión): Elementos relacionados con auditorías o NC (No Conformidades).
- **Neutros:** Escala de grises para fondos y bordes, asegurando alto contraste para entornos con iluminación variable.

---

## 4. Design Direction (Dirección de Diseño)

### 4.1 Chosen Design Approach
**Enfoque:** "Funcionalidad Industrial Moderna"

Este enfoque equilibra la densidad de información necesaria para los gestores con la claridad absoluta requerida por los operarios.

- **Para Escritorio (Gestión):** Uso eficiente del espacio en pantalla. Tablas densas pero legibles, paneles laterales colapsables para detalles de activos, y el Canvas como centro de comando visual.
- **Para Móvil (Operarios/Técnicos - TWA):** Diseño de tarjetas, navegación inferior (Bottom Navigation) para fácil alcance con el pulgar, y modales de pantalla completa para formularios para evitar distracciones.

---

## 5. User Journey Flows (Flujos de Usuario)

### 5.1 Critical User Paths

#### Flujo 0: Autenticación y Registro (Universal) - "Acceso Seguro y Rápido"
1.  **Login Inicial:** Usuario introduce email/usuario y contraseña.
2.  **Validación:** Sistema valida credenciales contra Supabase Auth.
3.  **Redirección:** Tras un login exitoso, el usuario es redirigido a la pantalla de inicio específica de su rol:
    - Operarios → Pantalla de Inicio Móvil (Reporte de Averías)
    - Técnicos → Listado de Órdenes de Trabajo Asignadas ("Mis Órdenes")
    - Supervisores → Listado General de Órdenes de Trabajo
    - Administradores → KPI Dashboard Principal
4.  **Sesión Persistente:** Login remembered para accesos futuros (TWA/tablets).

#### Flujo 0.1: Registro de Nuevo Usuario (Invitación)
1.  **Invitación:** Admin envía email con código de invitación.
2.  **Verificación:** Usuario introduce código y email.
3.  **First Login:** Sistema valida invitación y requiere cambio de contraseña.
4.  **Perfil Inicial:** Usuario selecciona rol base (Operario/Técnico) y capacidad técnica (N1-N5).
5.  **Welcome:** Dashboard personalizado según rol seleccionado.

#### Flujo A: Reporte de Avería (Operario) - "La Regla de los 5 Toques"
*(Simplificado para MVP: Sin Fotos ni QR)*
1.  **Inicio:** Abre la app (Login persistente - solo primera vez).
2.  **Selección:** Busca y selecciona "Línea/Máquina" de la lista o árbol de activos.
3.  **Reporte:** Selecciona síntoma predefinido o escribe breve descripción.
4.  **Acción:** Pulsa "Enviar Notificación (NL)".
    *   *Resultado:* Feedback visual de éxito y notificación a supervisores.

#### Flujo B: Gestión Diaria (Supervisor) - "El Daily Stand-up"
1.  **Revisión:** Abre el Canvas en pantalla grande/proyector.
2.  **Triaje:** Revisa la columna "Nuevas NL".
3.  **Conversión:** Arrastra una NL a la zona de planificación -> Se convierte en OT.
4.  **Asignación:** Filtra técnicos por especialidad y arrastra la OT al carril del técnico adecuado.
5.  **Bloqueo:** Si falta repuesto, marca la OT como "Bloqueada" (Visualmente distinta).

#### Flujo C: Ejecución y Cierre (Técnico)
1.  **Recepción:** Recibe Push Notification y aviso en **Centro de Notificaciones**.
2.  **Acción:** Abre "Mis Órdenes", ve la prioridad.
3.  **Trabajo:** Inicia cronómetro, consulta docs, solicita repuesto (descuento de stock).
    *   *Comunicación:* Si hay bloqueos o notas relevantes (ej. "Máquina no cedida"), añade un comentario en la **Bitácora de la OT**.
4.  **Cierre:** Completa informe, solicita validación.

#### Flujo D: Creación Directa de OT (Técnico/Supervisor/Admin)
*Cubre: Preventivos, Mejoras y Correctivos Directos*
1.  **Acceso:** Botón flotante "Nueva OT" (Móvil) o botón principal en Dashboard (Escritorio).
2.  **Configuración:** Selecciona Tipo (Preventiva / Mejora / **Correctiva Directa**) y Activo (Buscador).
3.  **Planificación:** Puede asignar fecha programada, prioridad y técnico responsable inmediatamente.
4.  **Guardado:** La OT se genera e inserta directamente en el flujo de trabajo (Estado: Pendiente/Asignada).

#### Flujo E: Gestión de Cumplimiento y NC (Responsable de Seguridad/Admin)
*Cumple FR26-FR29*
1.  **Alerta:** Recibe notificación de "Certificación por Caducar" o crea una NC tras inspección.
2.  **Registro:** Accede a "No Conformidades", crea nuevo registro vinculado al Activo.
3.  **Resolución:** Genera una OT correctiva directamente desde la ficha de la NC.
4.  **Bloqueo:** La NC queda en estado "Pendiente de OT" y no permite cierre hasta que la OT vinculada se complete.

#### Flujo F: Recepción de Repuestos (Técnico/Supervisor/Admin)
*Excluido: Operarios. Incluye Gestión de Ubicación.*
1.  **Recepción:** Recibe material físico.
2.  **Búsqueda:** Busca la referencia en el catálogo (manual/texto).
3.  **Ubicación:**
    *   *Repuesto Existente:* El sistema muestra la ubicación actual ("Pasillo A, Estante 3").
    *   *Nuevo Repuesto:* El usuario ingresa la nueva ubicación de almacenamiento.
4.  **Validación:** Ingresa cantidad y confirma entrada.

#### Flujo G: Gestión de Externos N5 (Admin/Supervisor)
*Gestión de Proveedores y Asignación*
1.  **Registro (Admin):** Da de alta "Empresa Proveedora" en ajustes (Nombre, Contacto, Especialidad).
2.  **Asignación (Canvas/OT):** Al crear o editar una OT, si se requiere un servicio N5, se selecciona "Asignar a Externo" y se elige la **empresa externa registrada** del listado.
3.  **Seguimiento:** La OT queda marcada como "Externa" (Color distintivo en Canvas) y se **mueve automáticamente a una columna/estado específico para OTs externas**. El cierre de estas OTs requiere validación manual de parte de trabajo externo por el Supervisor. El sistema no permitirá asignar un técnico interno a una OT marcada como "externa".

#### Flujo H: Gestión de Componentes y Rotables (Sustitución vs Reparación)
*Distinción crítica entre consumir repuestos y rotar componentes completos*

**Caso 1: Reparación In-Situ (Consumo)**
*   **Acción:** El técnico repara el equipo usando piezas menores (ej. rodamientos, juntas).
*   **Resultado:** Los repuestos se **descuentan del stock** definitivamente (se consumen). La OT se cierra y el equipo queda operativo.

**Caso 2: Sustitución de Rotable (Ciclo de Recuperación)**
*   **Acción:** El técnico retira un componente completo (ej. Bomba, Motor) y monta uno nuevo del almacén.
*   **Stock:** El stock del componente nuevo baja en 1.
*   **Recuperación:** El componente retirado ("Casco") **NO se desecha**. El sistema genera automáticamente una **"Solicitud de Reparación"** (NL de Taller) para ese ítem específico.
*   **Ciclo:** Esa solicitud sigue el flujo de aprobación -> OT de Reparación (Interna o Externa N5) -> Reingreso al Stock una vez reparado.

#### Flujo I: Visualización en Planta (Modo TV / Kiosco)
*Gestión Visual para pantallas compartidas*
1.  **Configuración (Admin):** El Admin selecciona qué KPIs mostrar (MTTR, MTBF, Top Averías) y el tiempo de rotación (ej. 30 seg).
2.  **Acceso (Usuario Display):** Se crea un usuario específico (ej. "pantalla_taller@...") con permisos de solo lectura y sesión infinita.
3.  **Ejecución:** Al loguearse en la Smart TV, entra directamente en "Modo Presentación".
4.  **Visualización:** La pantalla rota automáticamente entre los paneles configurados (Dashboard General -> Estado de Líneas -> Top Incidencias).

#### Flujo J: Ciclo de Aprovisionamiento (Generación de Compras)
*Puente entre Necesidades de Mantenimiento y Compras*
1.  **Detección de Necesidad:**
    *   *Automática:* El sistema detecta `Stock Actual < Stock Mínimo` y genera una "Alerta de Compra".
    *   *Manual:* Un técnico crea una "Solicitud de Compra" (SolC) para un material puntual.
2.  **Gestión de Necesidades (Admin/Compras):** Accede a la lista "Pendiente de Pedir". Filtra por Proveedor y selecciona los ítems a comprar.
3.  **Generación de OC:** Pulsa "Crear Orden de Compra".
    *   El sistema genera un registro `OC-XXXX` con estado **"Pedida / En Curso"**.
    *   (Opcional) Se genera PDF o se vincula referencia de ERP externo.
4.  **Recepción:** Al llegar el material (Flujo F), se recepciona contra esta OC, cerrándola y aumentando el stock.

### 5.2 View Structure & Sitemap (Inventario de Pantallas)

Para garantizar cobertura total de los FRs, la aplicación contará con las siguientes vistas. Las pantallas de inicio primarias para cada rol se han definido para optimizar el flujo de trabajo: **Operarios** irán a la pantalla móvil de Reporte de Averías, **Técnicos** a "Mis Órdenes", **Supervisores** al "Listado General de Órdenes de Trabajo", y **Administradores** al "KPI Dashboard Principal".

**1. Auth & Public**
*   `Login Screen`: Acceso simple email/password.
*   `User Profile`: Vista de "Mi Cuenta" para cambiar contraseña y ver datos propios.
*   *Nota:* El primer Admin se crea directamente en base de datos (Supabase). Invitaciones posteriores vía email.

**2. Dashboard & Navigation (Role Based)**
*   `Main Dashboard` (Desktop): KPIs, Resumen Planta. **Incluye "Centro de Notificaciones" (Campana) con historial de alertas.**
*   `Mobile Home` (TWA): Accesos grandes "Reportar Avería", "Mis Tareas".

**3. Asset Management (Activos)**
*   `Asset Tree View`: Explorador jerárquico.
*   `Asset Detail`: Ficha técnica, historial, documentos.
*   `Asset Search`: Buscador global (Texto).

**4. Work Management (Órdenes)**
*   `Planning Canvas`: Kanban Drag & Drop. **Incluirá columnas dedicadas para:**
    *   *Nuevas Solicitudes (NL y Reparaciones Pendientes)*
    *   *Planificación / Pendiente*
    *   *En Progreso (Planta)*
    *   *Taller / Reparación Interna*
    *   *Externo N5 (Proveedores)*
*   `Work Order List`: Vista lista completa. **Incluye botón "Exportar CSV" para reporting externo.**
*   `Work Order Detail`: Detalle completo OT. **Incluye pestaña "Bitácora/Chat" para comentarios e incidencias.**
*   `My Work` (Mobile): Lista simplificada técnicos.
*   `Report Issue Wizard` (Mobile): Flujo paso a paso para crear NLs.

**5. Inventory Management (Inventario)**
*   `Spare Parts Catalog`: Lista repuestos + Buscador. Botón para "Nueva Referencia" (Alta).
*   `Part Detail`: Ficha de repuesto, ubicaciones, historial de movimientos.
    *   **Funcionalidad de Control:** Botón "Ajuste de Stock / Regularización" (**Admin, Supervisor y Técnico**). Permite corregir manualmente la cantidad existente indicando motivo (Inventario, Rotura, Pérdida) para cuadrar físico vs sistema.
*   `Purchase Management (Compras):`
    *   **Lista de Necesidades:** Dashboard que agrupa "Alertas de Stock Mínimo" y "Solicitudes Manuales".
    *   **Gestor de OCs:** Vista para crear, ver y cancelar Órdenes de Compra.
*   `Stock Receipt Form` (FR23): Formulario de entrada de material.
    *   *Permisos:* **Técnicos y Supervisores** solo podrán recepcionar si hay una orden de compra o albarán pendiente. El **Administrador** puede recepcionar en cualquier momento (sin OC/albarán) y realizar cargas iniciales/masivas de inventario.
    *   *Exportación:* Listados de movimientos exportables a CSV.

**6. Quality & Compliance (Calidad)**
*   `Compliance Calendar`: Agenda vencimientos.
*   `Non-Conformities List`: Listado NCs.
*   `NC Detail`: Detalle y vínculos.

**7. Admin & Settings**
*   `User Management` (FR1-2): Tabla de usuarios, asignación de roles y niveles (N1-N5).
    *   **Gestión de Permisos Granular:** El Administrador tendrá un panel para activar/desactivar funcionalidades específicas por usuario (Toggles), independientemente de su rol base. Ejemplos: *Permiso para Regularizar Stock*, *Permiso para Crear OT Directa*, *Permiso para Validar Externos*.
*   `External Providers`: (Nuevo) ABM de Empresas/Proveedores de Mantenimiento (Permite registro, edición y eliminación de empresas externas para asignación de OTs N5).
*   `System Configuration`: Tablas maestras.
*   **Data Import Tool (Carga Masiva):** Herramienta exclusiva de Administrador, **accesible desde el Dashboard de Administración**, para la carga inicial y **actualización masiva continua** de datos (Activos y Repuestos) mediante plantillas Excel/CSV.
    *   *Recurso:* Incluye un enlace para descargar la **[Guía de Organización e Importación](../docs/asset-organization-guide.md)** con ejemplos para Activos y Stock Inicial.

**8. Analytics & Factory View (Nuevo)**
*   `KPI Dashboard` (Admin/Gerencia): Cuadros de mando interactivos con filtros de fecha. KPIs Clave:
    *   **MTTR:** Tiempo Medio de Reparación.
    *   **MTBF:** Tiempo Medio Entre Fallos (Fiabilidad).
    *   **Disponibilidad:** % Tiempo Operativo vs Tiempo Planificado.
    *   **Cumplimiento Preventivo:** % OTs Preventivas cerradas en fecha.
    *   **Costes:** Desglose por Repuestos y Horas Hombre.
    *   **Pareto de Averías:** Top 10 Activos con más paradas.
*   `TV Mode Configuration`: Selector de widgets y tiempos de rotación.
*   `TV / Kiosco View`: Vista de solo lectura, alto contraste y rotación automática para pantallas de planta.

---

## 6. Component Library (Biblioteca de Componentes)

### 6.1 Component Strategy
Se desarrollará un set de componentes "Atomic" reutilizables:

- **Cards (Tarjetas):**
    - `AssetCard`: Resumen de estado de máquina.
    - `TaskCard`: Elemento central del Canvas (OT/NL) con badges de estado, prioridad y asignado.
- **Inputs:**
    - `GiantButton`: Botones de acción principal con altura >50px para móvil.
    - `SearchInput`: Buscador de alto contraste con autocompletado (Sustituye QR).
- **Data Display:**
    - `StatusBadge`: Indicador de estado (Pendiente, En Progreso, Validado).
    - `StockLevel`: Indicador visual de inventario (Barra de progreso con cambio de color).
- **Navigation:**
    - `Sidebar` (Desktop) vs `BottomBar` (Mobile).

---

## 7. UX Pattern Decisions (Decisiones de Patrones UX)

### 7.1 Consistency Rules
- **Navegación:** Siempre visible. En móvil, las acciones críticas flotan (FAB) o están en la zona inferior fija.
- **Feedback:** Toda acción destructiva o de cambio de estado importante requiere confirmación o posibilidad de "Deshacer" (Toast con Undo) brevemente.
- **Formularios:** Validación en tiempo real. Los campos obligatorios se marcan claramente. En móvil, el teclado virtual debe adaptarse al tipo de dato (numérico para stock, texto para descripción).
- **Carga:** Skeletons screens en lugar de spinners para percibir mayor velocidad (NFR1).

---

## 8. Responsive Design & Accessibility (Diseño Responsivo y Accesibilidad)

### 8.1 Responsive Strategy
La aplicación es **Mobile-First** conceptualmente para la ejecución, pero **Desktop-First** para la planificación.

- **Breakpoints:**
    - **Mobile (<640px):** Vista de lista, tarjetas expandibles, menús hamburguesa/inferiores. El Canvas se convierte en listas filtrables por estado.
    - **Tablet (640px - 1024px):** Vista híbrida. El Canvas muestra menos columnas o scroll horizontal. Menú lateral colapsado.
    - **Desktop (>1024px):** Vista completa. Canvas extendido, paneles laterales fijos, tablas de datos complejas visibles.

### 8.2 Accessibility (NFR7)
- **Contraste:** Ratio mínimo de 4.5:1 para texto normal, 3:1 para texto grande y componentes gráficos.
- **Tamaño Táctil:** Áreas interactivas mínimas de 44x44px (recomendado 48x48px para guantes).
- **Fuentes:** Tamaños base de 16px, escalables. Soporte para zoom del navegador sin romper el layout.

---

## 9. Implementation Guidance (Guía de Implementación)

### 9.1 Completion Summary
Esta especificación cubre los requisitos funcionales (FR1-FR30) y no funcionales (NFR1-NFR9) del PRD.
- La estructura de navegación soporta los roles definidos (FR1).
- El diseño del Canvas responde a la necesidad de planificación visual (FR12-FR15).
- La interfaz móvil cumple con la simplicidad requerida para operarios y el entorno industrial (NFR5-NFR7).

**Nota Importante para el Desarrollo:** Para la implementación visual de cada pantalla, por favor, consulte los detalles de diseño y los wireframes en el documento `docs/ui-wireframes.md`. Este documento es la guía visual para construir las interfaces.

---

## Appendix

### Related Documents
- Product Requirements: `../prd.md`
- Design Guidelines: TBD
- Wireframes Visuales: `../ui-wireframes.md`

### Version History
| Fecha | Versión | Cambios | Autor |
| ----- | ------- | ------- | ----- |
| 2025-11-28 | 1.0 | Creación inicial basada en PRD v2.0 | Bernardo |
