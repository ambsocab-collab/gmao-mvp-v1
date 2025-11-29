# Epic 1 - Foundation & User Management Testing Setup

## 🎯 Overview

Este documento describe el setup de pruebas para el Epic 1, diseñado específicamente para mitigar los riesgos de seguridad identificados en el análisis de riesgos.

## 🔍 Riesgos Mitigados

### R-001: Autenticación Comprometida (Score: 6)
- **Probabilidad**: 2, **Impacto**: 3
- **Mitigación**: Tests exhaustivos de autenticación y sesión

### R-002: Gestión de Roles Incorrecta (Score: 6)
- **Probabilidad**: 2, **Impacto**: 3
- **Mitigación**: Tests de control de acceso basado en roles (RBAC)

### R-003: Configuración Inicial Incorrecta (Score: 6)
- **Probabilidad**: 3, **Impacto**: 2
- **Mitigación**: Validación automatizada de configuración

### R-004: Pérdida de Datos de Usuario (Score: 3)
- **Probabilidad**: 1, **Impacto**: 3
- **Mitigación**: Tests de integridad de datos

## 📁 Estructura de Tests

```
tests/
├── setup.ts                          # Configuración de Playwright para Epic 1
├── global-setup.ts                   # Setup global de ambiente de testing
├── e2e/
│   └── auth/
│       └── authentication-p0.spec.ts  # Tests E2E de autenticación (P0)
├── api/
│   └── auth/
│       └── role-based-access-p0.spec.ts # Tests API de RBAC (P0)
├── unit/                             # Tests unitarios (pendientes)
└── helpers/
    ├── auth-helper.ts                 # Helper para autenticación
    └── api-helper.ts                  # Helper para API testing
```

## 🚀 Ejecutar Tests

### Prerrequisitos

1. Instalar dependencias:
```bash
npm install @playwright/test playwright
```

2. Configurar variables de entorno:
```bash
cp .env.test .env.local
# Editar .env.local con las credenciales locales
```

### Comandos de Testing

```bash
# Tests P0 críticos (seguridad)
npm run test:epic1:p0

# Tests P1 alta prioridad
npm run test:epic1:p1

# Tests de smoke (5 minutos)
npm run test:epic1:smoke

# Tests enfocados en seguridad
npm run test:epic1:security

# Todos los tests del Epic 1
npm run test:epic1:all

# Ver reporte de resultados
npm run test:epic1:report
```

## 🔐 Configuración de Seguridad

### Variables de Entorno Requeridas

```bash
# Supabase Local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>

# Test Users
TEST_ADMIN_EMAIL=admin@gmao-test.com
TEST_ADMIN_PASSWORD=admin123456
TEST_TECHNICIAN_EMAIL=tech@gmao-test.com
TEST_TECHNICIAN_PASSWORD=tech123456
TEST_OPERATOR_EMAIL=operator@gmao-test.com
TEST_OPERATOR_PASSWORD=operator123456
```

### Configuración de Roles

El sistema implementa 4 roles principales:

1. **Admin**: Acceso completo a administración
2. **Technician**: Acceso limitado a funciones técnicas
3. **Supervisor**: Acceso a supervisión y validación
4. **Operator**: Acceso básico a operaciones

## 📊 Matriz de Cobertura

### P0 - Críticos (Corren en cada commit)
- ✅ Login/logout con credenciales válidas
- ✅ Rechazo de credenciales inválidas
- ✅ Persistencia de sesión
- ✅ Control de acceso basado en roles
- ✅ Prevención de acceso no autorizado

### P1 - Alta Prioridad (Corren en PR a main)
- 🔄 Niveles de capacidad técnica (N1-N5)
- 🔄 Sistema de invitación de usuarios
- 🔄 Validación de configuración inicial

### P2/P3 - Media/Baja Prioridad
- ⏳ Tests unitarios de lógica de negocio
- ⏳ Tests de rendimiento
- ⏳ Tests de accesibilidad

## 🎪 Criterios de Calidad

### Pas/Fail

- **P0**: 100% deben pasar (sin excepciones)
- **P1**: ≥95% deben pasar
- **P2/P3**: ≥90% deben pasar

### Cobertura de Seguridad

- **Escenarios de autenticación**: 100%
- **Control de acceso**: 100%
- **Validación de roles**: 100%

## 🔧 Integración CI/CD

### GitHub Actions Workflow

```yaml
name: Epic 1 Security Tests
on: [push, pull_request]
jobs:
  epic1-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:epic1:p0
      - uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report-epic1/
```

## 🐛 Troubleshooting

### Issues Comunes

1. **Supabase no está accesible**
   - Verificar que `supabase start` se ejecutó correctamente
   - Revisar variables de entorno en `.env.local`

2. **Tests fallan con timeout**
   - Verificar que la aplicación está corriendo en `http://localhost:3000`
   - Aumentar timeouts en `tests/setup.ts`

3. **Autenticación falla**
   - Verificar que los usuarios de测试 existen en la base de datos
   - Revisar configuración de auth en Supabase

### Logs y Debug

```bash
# Ver logs de Supabase
supabase logs

# Ejecutar tests con debug
npx playwright test --debug

# Ver reporte HTML
npm run test:epic1:report
```

## 📈 Próximos Pasos

1. ✅ Configurar estructura de tests
2. ✅ Implementar tests P0 críticos
3. 🔄 Implementar tests P1
4. ⏳ Configurar Supabase local completo
5. ⏳ Integrar con pipeline CI/CD
6. ⏳ Agregar tests de rendimiento

---

**Status**: En progreso - Tests P0 implementados y listos para ejecución
**Owner**: QA Team
**Timeline**: Q1 2025 - Epic 1 Implementation