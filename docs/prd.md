# GMAO - Product Requirements Document

**Author:** Bernardo
**Date:** 2025-11-27
**Version:** 2.0

---

## Executive Summary

El GMAO es un sistema integral de gestión de mantenimiento diseñado para transformar completamente las operaciones de mantenimiento en fábricas industriales. Partiendo de cero, este proyecto crea una solución web moderna (Next.js + Supabase) que sirve desde operadores de línea hasta gerentes de planta.

### What Makes This Special

- **Canvas Visual Colaborativo:** Sistema único de asignación mediante tarjetas para reuniones diarias, facilitando la planificación ágil.
- **Gestión de Capacidades (Niveles N):** Diferenciación inteligente entre el ROL de acceso (Operario, Técnico) y la CAPACIDAD técnica (N1-N5) para realizar tareas.
- **Modelo de Activos Flexible:** Estructura multidimensional (Jerarquía + Familias + Sistemas) que se adapta a cualquier maquinaria.
- **Flujo Digital Continuo:** Desde la detección por el operario (TWA Móvil) hasta el cierre validado por supervisión.

---

## Project Classification

**Technical Type:** Web Application (PWA/TWA capable)
**Domain:** Industrial / Enterprise
**Complexity:** Medium-High

### Domain Context

El entorno es una planta industrial activa. El sistema debe soportar operaciones críticas donde el tiempo de inactividad cuesta dinero. La usabilidad debe ser apta para entornos ruidosos y operarios con guantes (interfaces de alto contraste, botones grandes). La conectividad es buena (Online First), eliminando la complejidad de sincronización offline.

---

## Success Criteria

1.  **Adopción del Operario:** < 5 toques para reportar una avería crítica.
2.  **Eficiencia de Planificación:** Reducción del 50% en el tiempo de la reunión diaria de mantenimiento gracias al Canvas.
3.  **Calidad del Dato:** 100% de las órdenes cerradas tienen imputación correcta de horas y repuestos (validación obligatoria).
4.  **Disponibilidad:** Sistema disponible 99.9% durante turnos de producción.
5.  **Fiabilidad de Inventario:** Discrepancia < 5% entre stock físico y digital tras 3 meses de uso (gracias a flujos de regularización y recepción controlada).

---

## Product Scope

### MVP - Minimum Viable Product

1.  **Gestión de Usuarios:** Roles (Operario, Técnico, Supervisor, Admin) y Capacidades (N1-N5).
2.  **Gestión de Activos:** Catálogo flexible (Jerarquía Padre-Hijo, Familias).
3.  **Reporte de Averías:** Interfaz móvil TWA para operarios (Notificaciones de Línea - NL).
4.  **Gestión de Órdenes (OT):**
    *   Conversión NL -> OT.
    *   Creación directa de OT.
    *   Flujo de Terceros (N5/Externos).
5.  **Canvas Visual:** Tablero Kanban para asignación y seguimiento en tiempo real.
6.  **Inventario Básico:** Stock de repuestos, imputación a órdenes y alertas de mínimo.
7.  **Ejecución:** Mi trabajo (Técnicos), Cierre y Validación (Supervisor).

### Growth Features (Post-MVP)

1.  **Mantenimiento Predictivo:** Generación de órdenes basada en horas de uso/ciclos.
2.  **Inteligencia Artificial:** Transcripción de voz a texto avanzada para diagnósticos.
3.  **Costes Avanzados:** Cálculo automático de coste total de propiedad (TCO) por activo.
4.  **Integración IoT:** Lectura directa de sensores de máquinas.

---

## Functional Requirements

### 1. User Account & Access

- **FR1:** El sistema debe gestionar el acceso basado estrictamente en **ROLES**: Operario, Técnico, Supervisor, Administrador.
- **FR2:** El sistema debe gestionar la **CAPACITACIÓN** técnica mediante niveles (N1-N5) asignados a cada usuario, independiente de su rol de acceso.
- **FR3:** Los administradores pueden invitar usuarios por email; el sistema gestiona el flujo de registro y primer cambio de contraseña obligatorio.
- **FR4:** La autenticación debe persistir (Supabase Auth) y ser segura, soportando sesiones largas para tablets de planta.

### 2. Asset & Equipment Management

- **FR5:** El sistema debe soportar una estructura de activos **Multidimensional**: Jerarquía (Padre-Hijo ilimitado), Tipología (Familias con atributos) y Sistemas (Agrupación funcional).
- **FR6:** Cada activo debe tener ficha técnica, historial de intervenciones y documentación adjunta.
- **FR7:** El sistema debe permitir la búsqueda predictiva de activos por nombre, código o etiqueta (QR).

### 3. Order Management - Creation Flows

- **FR8 (Flujo Reactivo):** Los operarios deben poder crear "Notificaciones de Línea" (NL) desde interfaz móvil simplificada (Línea, Equipo, Síntoma, Foto).
- **FR9 (Flujo Directo):** Técnicos y Supervisores deben poder crear "Órdenes de Trabajo" (OT) directamente (Preventivas/Mejoras) sin pasar por NL.
- **FR10 (Flujo Externo N5):** El sistema debe permitir asignar OTs a "Empresas Externas" registradas, gestionando proveedores y sus competencias.
- **FR11:** El sistema debe permitir la conversión de NL a OT, tanto individualmente como desde el Canvas Visual.

### 4. Visual Planning (Canvas)

- **FR12:** El sistema debe proporcionar un **Canvas Visual** (Tablero Kanban) que muestre OTs y NLs pendientes.
- **FR13:** El Canvas debe permitir asignar/reasignar OTs a técnicos mediante "Drag & Drop".
- **FR14:** El Canvas debe reflejar estados en tiempo real (Pendiente, En Progreso, Pausado, Bloqueado por Repuesto).
- **FR15:** El Canvas debe soportar filtros visuales por Línea, Prioridad (Semáforo) y Técnico.

### 5. Execution & Tracking

- **FR16:** Los técnicos deben tener una vista "Mis Órdenes" optimizada para móvil/tablet.
- **FR17:** El registro de trabajo debe incluir: Diagnóstico, Acciones, Tiempo empleado y Repuestos consumidos.
- **FR18:** El sistema debe soportar el flujo de "Solicitud de Cierre" por el técnico y "Validación Final" por el Supervisor.
- **FR19:** El sistema debe gestionar estados de bloqueo (ej: "Esperando Repuesto") y notificar a los responsables.

### 6. Inventory & Spare Parts

- **FR20:** El sistema debe gestionar catálogo de repuestos con codificación estructurada.
- **FR21:** El stock debe descontarse automáticamente al ser imputado en una OT.
- **FR22:** El sistema debe generar alertas visuales y notificaciones cuando el stock cae bajo el mínimo.
- **FR23:** Gestión de Entradas: Recepción controlada contra "Orden de Compra". Excepciones permitidas para "Carga Inicial" de datos y "Entrada Directa" exclusiva para el rol de Administrador.

### 7. Notifications & Alerts

- **FR24:** El sistema debe enviar notificaciones push/email ante eventos críticos (Nueva NL Urgente, Stock Crítico, Asignación de OT).
- **FR25:** Las notificaciones deben ser accionables (llevar directamente al elemento relevante).

### 8. Regulatory Compliance & Non-Conformities

- **FR26:** El sistema debe gestionar un **Calendario de Cumplimiento Legal** para activos críticos (Calderas, PCI, etc.), con alertas de caducidad de certificaciones.
- **FR27:** El sistema debe permitir registrar **No Conformidades (NC)** derivadas de inspecciones, con clasificación de gravedad y plazo límite de resolución.
- **FR28 (Flujo NC -> OT):** El sistema debe permitir generar Órdenes de Trabajo (OT) vinculadas directamente a una NC para su subsanación.
- **FR29:** El sistema debe impedir el cierre de una NC hasta que la OT correctiva vinculada esté validada.
- **FR30:** Repositorio documental específico por activo para certificados legales y actas de inspección.

### 9. Advanced Maintenance & Rotables

- **FR31 (Sustitución de Rotables):** El sistema debe permitir a los técnicos realizar la "Sustitución de Componente" dentro de una OT, descontando una unidad nueva del stock y marcando la unidad retirada como "A Recuperar".
- **FR32 (Ciclo de Recuperación):** Las unidades "A Recuperar" deben generar automáticamente una "Solicitud de Reparación", iniciando un flujo de trabajo para su reparación interna o externa y posterior reingreso al stock.

### 10. Procurement Cycle (Aprovisionamiento)

- **FR33 (Gestión de Necesidades):** El sistema debe centralizar las necesidades de compra generadas automáticamente (Stock < Mínimo) y manualmente (Solicitudes de Técnicos) en un panel de administración.
- **FR34 (Generación de OC):** El sistema debe permitir agrupar múltiples necesidades en una única "Orden de Compra" (OC) por proveedor y generar el registro correspondiente para su seguimiento.

### 11. Data & Administration

- **FR35 (Regularización de Stock):** El sistema debe permitir realizar ajustes manuales de inventario (Regularización) indicando un motivo auditado (Rotura, Conteo Cíclico, Pérdida), accesible para roles autorizados.
- **FR36 (Carga Masiva):** El sistema debe proporcionar herramientas para la importación y actualización masiva de Activos y Repuestos mediante archivos estandarizados (CSV/Excel).
- **FR37 (Exportación de Datos):** Las listas principales (OTs, Movimientos de Stock) deben permitir la exportación de datos a formato CSV para análisis externo.
- **FR38 (Permisos Granulares):** El sistema debe permitir al Administrador activar/desactivar capacidades específicas (ej. "Regularizar Stock", "Validar Externos") a nivel de usuario individual, independientemente de su rol base.

### 12. Analytics & Visual Management

- **FR39 (Dashboard de KPIs):** El sistema debe calcular y visualizar métricas clave de mantenimiento: MTTR (Tiempo Medio de Reparación), MTBF (Tiempo Medio Entre Fallos), Disponibilidad y Cumplimiento de Preventivos.
- **FR40 (Modo TV / Kiosco):** El sistema debe incluir una vista simplificada de alto contraste y rotación automática para pantallas de planta, accesible mediante un usuario específico de tipo "Display".

### 13. Collaboration

- **FR41 (Bitácora de OT):** Cada Orden de Trabajo debe incluir un registro de actividad (chat/log) persistente para comunicación interna, incidencias y notas de bloqueo entre turnos.

---

## Non-Functional Requirements

### Performance
- **NFR1:** Tiempo de carga de dashboards críticos < 2 segundos.
- **NFR2:** Actualización del Canvas en tiempo real (< 500ms de latencia percibida).

### Security
- **NFR3:** Control de acceso RBAC estricto (Row Level Security en base de datos).
- **NFR4:** Datos sensibles (costes, contratos externos) visibles solo para roles autorizados.

### Platform & Usability
- **NFR5:** **Online First:** Arquitectura dependiente de conexión (buena cobertura en planta confirmada).
- **NFR6:** **TWA/PWA:** La aplicación debe ser instalable en dispositivos Android industriales como Trusted Web Activity.
- **NFR7:** Diseño "Industrial": Alto contraste, botones grandes (>44px) para uso con guantes.

### Reliability
- **NFR8:** Disponibilidad del servicio 99.9% en horario operativo.
- **NFR9:** Backups automáticos diarios de la base de datos.

---

_Este PRD prevalece sobre documentos anteriores en caso de conflicto, alineándose estrictamente con la Especificación de Diseño UX v2.0._
