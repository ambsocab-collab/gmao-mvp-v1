# Guía de Organización e Importación de Activos (GMAO)

Esta guía describe cómo estructurar los activos de su planta para cargarlos masivamente en el sistema GMAO.

---

## 1. Estrategia de Organización

El sistema utiliza una estructura **jerárquica (Padre-Hijo)** para organizar los equipos. Esto permite navegar desde la ubicación más general hasta el componente más específico.

### Niveles Recomendados
1.  **Ubicación Principal** (Ej. Planta Principal, Nave A)
2.  **Línea / Proceso** (Ej. Línea de Envasado 1, Zona de Calderas)
3.  **Máquina / Equipo** (Ej. Etiquetadora Rotativa, Compresor Atlas)
4.  **Componente Mayor** (Opcional - Ej. Motor Principal, Cinta Transportadora)

### Clasificación Adicional
Además de la ubicación (Padre-Hijo), cada activo debe clasificarse por:
*   **Familia:** Tipo de equipo (Ej. Motores, Bombas, Cintas). Permite aplicar preventivos a todos los equipos del mismo tipo.
*   **Criticidad:** Importancia para la producción (A-Crítico, B-Importante, C-Normal).

---

## 2. Estructura del Archivo de Importación (Excel/CSV)

Para la "Puesta en Marcha", debe preparar un archivo Excel con las siguientes columnas. El orden es importante.

| Columna (Header) | Descripción | Obligatorio | Ejemplo |
| :--- | :--- | :---: | :--- |
| **CODIGO** | Identificador único del activo. Puede ser el nro. de inventario o un código corto. | SÍ | `L-ENV-01` |
| **NOMBRE** | Nombre descriptivo del activo. | SÍ | `Línea de Envasado 1` |
| **CODIGO_PADRE** | El `CODIGO` del activo superior donde está ubicado. Dejar vacío si es un nivel raíz (Nave/Planta). | NO | `NAVE-A` |
| **FAMILIA** | Categoría técnica del equipo. | SÍ | `LINEA_PRODUCCION` |
| **UBICACION_TXT** | Descripción de texto de dónde está (para ayuda visual). | NO | `Nave A, Pasillo Central` |
| **CRITICIDAD** | Nivel de importancia (HIGH, MED, LOW). | SÍ | `HIGH` |
| **MARCA** | Fabricante del equipo. | NO | `Krones` |
| **MODELO** | Modelo del equipo. | NO | `Topmatic` |
| **NUM_SERIE** | Número de serie del fabricante. | NO | `K-998877` |

---

## 3. Ejemplo Práctico de Carga

A continuación se muestra cómo rellenar el Excel para crear una estructura completa: **Nave -> Línea -> Máquina -> Motor**.

| CODIGO | NOMBRE | CODIGO_PADRE | FAMILIA | CRITICIDAD |
| :--- | :--- | :--- | :--- | :--- |
| **NAVE-A** | Nave de Producción A | *(Vacío)* | EDIFICIO | LOW |
| **L-ENV-01** | Línea de Envasado 1 | **NAVE-A** | LINEA | HIGH |
| **ETIQ-01** | Etiquetadora Rotativa | **L-ENV-01** | MAQUINARIA | HIGH |
| **MOT-ETIQ-01** | Motor Principal Etiquetadora | **ETIQ-01** | MOTOR_ELEC | MED |

### ¿Cómo lo interpreta el sistema?
Al importar estas 4 filas, el sistema creará automáticamente este árbol:

*   📂 **Nave de Producción A**
    *   📂 **Línea de Envasado 1**
        *   ⚙️ **Etiquetadora Rotativa**
            *   🔩 **Motor Principal Etiquetadora**

---

## 4. Notas Importantes

*   **Códigos Únicos:** No puede haber dos activos con el mismo `CODIGO`.
*   **Orden de Carga:** El sistema es inteligente, pero se recomienda ordenar el Excel desde los niveles superiores (Naves) hacia los inferiores (Componentes) para evitar advertencias de "Padre no encontrado".
*   **Familias:** Si usa una FAMILIA que no existe en el sistema, se creará automáticamente durante la importación.

---

## 5. Carga Masiva de Repuestos (Inventario Inicial)

Para cargar el catálogo de repuestos y su stock inicial, se utiliza una plantilla Excel separada.

### Estructura del Archivo de Repuestos

| Columna (Header) | Descripción | Obligatorio | Ejemplo |
| :--- | :--- | :---: | :--- |
| **CODIGO_REF** | Referencia única del repuesto (SKU/Ref. Fabricante). | SÍ | `REF-6204-ZZ` |
| **NOMBRE** | Nombre descriptivo del repuesto. | SÍ | `Rodamiento Rígido Bolas 6204-ZZ` |
| **FAMILIA** | Categoría del repuesto (Rodamientos, Eléctrico, Neumática...). | SÍ | `RODAMIENTOS` |
| **STOCK_MIN** | Cantidad mínima antes de lanzar alerta de compra. | NO | `2` |
| **STOCK_INICIAL** | Cantidad física real al momento de la carga. | NO | `10` |
| **UBICACION** | Texto descriptivo de dónde se almacena. | NO | `Pasillo A, Estante 2` |
| **COSTE_UNIT** | Coste unitario estimado (para valoración). | NO | `4.50` |

### Ejemplo Práctico

| CODIGO_REF | NOMBRE | FAMILIA | STOCK_MIN | STOCK_INICIAL | UBICACION |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REF-6204-ZZ** | Rodamiento 6204-ZZ | RODAMIENTOS | 5 | 20 | Estantería A-02 |
| **SEN-IND-01** | Sensor Inductivo M12 | SENSORES | 2 | 0 | Armario Eléctrico |
| **ACEITE-46** | Aceite Hidráulico ISO 46 | LUBRICANTES | 10 | 50 | Almacén Líquidos |

---

## 6. Vinculación Activo-Repuesto (BOM) - *Opcional*

Puede cargar una tercera hoja para definir qué repuestos usa cada máquina ("Lista de Materiales" o Bill of Materials).

| ACTIVO_CODIGO | REPUESTO_CODIGO | CANTIDAD_USO |
| :--- | :--- | :--- |
| **ETIQ-01** | **REF-6204-ZZ** | 4 |
| **ETIQ-01** | **SEN-IND-01** | 2 |

Esto permite que, al crear una OT para la "Etiquetadora Rotativa", el sistema sugiera automáticamente estos repuestos.
