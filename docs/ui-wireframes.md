# GMAO-MVP-V1 High-Fidelity Design Spec & Wireframes

**Version:** 2.0 (Updated for High-Quality Details)
**Date:** 30 Noviembre 2025
**Designer:** Bernardo (AI Agent)
**Design System:** Industrial UI (Tailwind CSS + Shadcn/UI + Lucide React)

---

## 1. Global Design Tokens & Components
*Standardized reusable elements ensuring consistency across the app.*

### 1.1 Color Palette (Tailwind Semantic Mapping)
| Role | Token | Tailwind Utility | Visual Meaning |
|---|---|---|---|
| **Background** | `bg-background` | `bg-slate-50` | App base background (reduced eye strain). |
| **Surface** | `bg-card` | `bg-white shadow-sm border border-slate-200` | Content containers (Cards, Modals). |
| **Primary** | `bg-primary` | `bg-blue-600 hover:bg-blue-700 text-white` | Main actions (Login, Create, Save). |
| **Secondary** | `bg-secondary` | `bg-white hover:bg-slate-50 border-slate-300 text-slate-700` | Cancel, Filters, Secondary options. |
| **Destructive** | `bg-destructive` | `bg-red-600 hover:bg-red-700 text-white` | Delete, Stop Machine, Critical Action. |
| **Status: OK** | `bg-emerald-100` | `bg-emerald-100 text-emerald-800 border-emerald-200` | Operational, Closed, Completed. |
| **Status: Warn**| `bg-amber-100` | `bg-amber-100 text-amber-800 border-amber-200` | Low Stock, Pending Review. |
| **Status: Bad** | `bg-red-100` | `bg-red-100 text-red-800 border-red-200` | Stopped, Error, Out of Stock. |
| **Header** | `bg-header` | `bg-slate-900 text-slate-50` | Top navigation bar (Professional look). |

### 1.2 Typography (Inter/Roboto)
- **Page Title (H1):** `text-2xl font-bold text-slate-900 tracking-tight`
- **Section Title (H2):** `text-lg font-semibold text-slate-800`
- **Body Text:** `text-sm text-slate-600 leading-relaxed` (Desktop) / `text-base` (Mobile)
- **Small/Meta:** `text-xs text-slate-500 font-medium`

### 1.3 Core Component Specs
- **Buttons (Desktop):** `h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:ring-2`
- **Buttons (Mobile - Touch):** `h-12 px-6 text-base font-semibold rounded-lg active:scale-95 transition-transform`
- **Inputs:** `h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`
- **Cards:** `rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200`

---

## 2. Authentication & Profile

### 2.1 Login Screen (Unified)
**Layout:** Centered Card on Split Background (Slate-900 Left / Slate-50 Right).
**Constraint:** Max-width 400px for the form card.

```tsx
// Structure Visualization
<div className="min-h-screen flex items-center justify-center bg-slate-50">
  <Card className="w-full max-w-md p-8 space-y-6 shadow-lg">
    {/* Header */}
    <div className="text-center space-y-2">
      <Logo className="h-12 w-12 mx-auto text-blue-600" />
      <h1 className="text-2xl font-bold text-slate-900">Bienvenido a GMAO</h1>
      <p className="text-sm text-slate-500">Ingresa tus credenciales para continuar</p>
    </div>

    {/* Form */}
    <form className="space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" placeholder="usuario@planta.com" className="h-11" />
      </div>
      <div className="space-y-2">
        <Label>Contraseña</Label>
        <Input type="password" placeholder="••••••••" className="h-11" />
      </div>
      
      <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-lg">
        Iniciar Sesión
      </Button>
    </form>

    {/* Footer */}
    <div className="flex justify-between text-sm mt-4">
        <Link className="text-blue-600 hover:underline">¿Olvidaste tu contraseña?</Link>
        <span className="text-slate-400">v1.0.0</span>
    </div>
  </Card>
</div>
```

### 2.2 Role Selection (Onboarding)
**Layout:** Grid of large selectable cards.

```tsx
// "Card Selection" Component
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Option 1: Operario */}
  <button className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group text-left">
    <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200">
      <HardHat className="h-6 w-6 text-slate-600 group-hover:text-blue-700" />
    </div>
    <h3 className="font-bold text-lg text-slate-900">Soy Operario</h3>
    <p className="text-sm text-slate-500 mt-1">Reporto averías y consulto estado de líneas.</p>
  </button>

  {/* Option 2: Técnico */}
  <button className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group text-left">
    <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200">
      <Wrench className="h-6 w-6 text-slate-600 group-hover:text-blue-700" />
    </div>
    <h3 className="font-bold text-lg text-slate-900">Soy Técnico</h3>
    <p className="text-sm text-slate-500 mt-1">Ejecuto órdenes de trabajo y gestiono repuestos.</p>
  </button>
</div>
```

---

## 3. Dashboard & Navigation

### 3.1 Admin Dashboard (Desktop)
**Layout:** Sidebar + Topbar + Grid Content.

```tsx
// KPI Cards Row
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* KPI Card Example */}
  <Card className="p-6">
    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
      <h3 className="tracking-tight text-sm font-medium text-slate-500">Paradas Activas</h3>
      <AlertOctagon className="h-4 w-4 text-red-600" />
    </div>
    <div className="text-2xl font-bold text-slate-900">3</div>
    <p className="text-xs text-red-600 mt-1 font-medium">+1 vs ayer</p>
  </Card>
  {/* ... other KPIs */}
</div>

// Main Content Area
<div className="grid gap-4 md:grid-cols-7 mt-6">
    {/* Chart Section (Span 4) */}
    <Card className="col-span-4 p-6">
        <h3 className="font-semibold mb-4">Disponibilidad por Línea (7 días)</h3>
        <div className="h-[300px] w-full bg-slate-50 rounded-lg flex items-center justify-center">
            {/* Chart Component Placeholder */}
            <BarChart />
        </div>
    </Card>

    {/* Recent Activity Feed (Span 3) */}
    <Card className="col-span-3 p-6">
        <h3 className="font-semibold mb-4">Última Actividad</h3>
        <div className="space-y-4">
            {/* Activity Item */}
            <div className="flex items-start gap-3">
                <span className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                <div>
                    <p className="text-sm font-medium">Juan Pérez completó OT-1234</p>
                    <p className="text-xs text-slate-500">Hace 15 min • Extrusora A-01</p>
                </div>
            </div>
            {/* ... more items */}
        </div>
    </Card>
</div>
```

### 3.2 Mobile Home (Operario/Técnico)
**Layout:** Single Column, Big Targets.

```tsx
// Sticky Header
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur p-4 flex justify-between items-center">
    <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">JP</Avatar>
        <div>
            <p className="text-sm font-bold leading-none">Juan Pérez</p>
            <p className="text-xs text-slate-500">Operario N3</p>
        </div>
    </div>
    <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
</header>

// Main Actions
<main className="p-4 space-y-4">
    {/* Giant Action Button: Reportar */}
    <button className="w-full h-32 bg-red-600 active:bg-red-700 rounded-2xl shadow-lg flex flex-col items-center justify-center text-white gap-2 transition-transform active:scale-[0.98]">
        <AlertTriangle className="h-10 w-10" />
        <span className="text-xl font-bold">REPORTAR AVERÍA</span>
    </button>

    {/* Secondary Action: Mis Tareas */}
    <button className="w-full h-24 bg-white border-2 border-blue-100 active:bg-blue-50 rounded-2xl shadow-sm flex flex-row items-center justify-between px-8 text-slate-800 transition-transform active:scale-[0.98]">
        <div className="flex flex-col text-left">
            <span className="text-lg font-bold text-blue-900">Mis Tareas</span>
            <span className="text-sm text-slate-500">3 Pendientes</span>
        </div>
        <ChevronRight className="h-6 w-6 text-slate-400" />
    </button>

    {/* Search Input */}
    <div className="relative mt-6">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <Input className="h-12 pl-10 text-lg rounded-xl shadow-sm" placeholder="Buscar máquina..." />
    </div>
</main>
```

---

## 4. Work Management (Canvas & OTs)

### 4.1 Planning Canvas (Kanban)
**Layout:** Horizontal Scroll Container with Flex Columns.

```tsx
// Canvas Container
<div className="flex h-[calc(100vh-64px)] overflow-x-auto p-4 gap-4 bg-slate-100 items-start">
    
    {/* Column: Pendientes */}
    <div className="w-80 flex-shrink-0 flex flex-col gap-3">
        <header className="flex justify-between items-center px-2">
            <h4 className="font-semibold text-slate-700">Pendientes (5)</h4>
            <Badge variant="outline">New</Badge>
        </header>
        
        {/* Draggable Task Card */}
        <Card className="cursor-grab active:cursor-grabbing hover:shadow-md border-l-4 border-l-red-500 p-3 space-y-2">
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500">#OT-1240</span>
                <Badge variant="destructive" className="text-[10px]">Parada</Badge>
            </div>
            <p className="font-bold text-sm leading-tight">Fuga de aceite en grupo hidráulico</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3" /> Prensa 01
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <Avatar className="h-6 w-6 text-[10px]">Un</Avatar> {/* Unassigned */}
                <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 2h
                </span>
            </div>
        </Card>
        {/* ... more cards */}
    </div>

    {/* Column: En Progreso */}
    <div className="w-80 flex-shrink-0 flex flex-col gap-3">
        {/* ... content */}
    </div>
</div>
```

### 4.2 Work Order Detail (Comprehensive)
**Layout:** Header + 3-Column Grid (Info, Tasks/Log, Parts).

```tsx
// Header
<div className="border-b bg-white p-6 flex justify-between items-start">
    <div>
        <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">OT-1234: Cambio Rodamiento</h1>
            <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>
        </div>
        <p className="text-slate-500 flex items-center gap-2">
            <Wrench className="h-4 w-4" /> Mantenimiento Correctivo • Extrusora A-01
        </p>
    </div>
    <div className="flex gap-2">
        <Button variant="outline">Pausar</Button>
        <Button>Finalizar Trabajo</Button>
    </div>
</div>

// Content Tabs
<Tabs defaultValue="log" className="p-6">
    <TabsList className="mb-4">
        <TabsTrigger value="details">Detalles</TabsTrigger>
        <TabsTrigger value="log">Bitácora & Chat</TabsTrigger>
        <TabsTrigger value="parts">Repuestos (2)</TabsTrigger>
    </TabsList>

    <TabsContent value="log" className="max-w-3xl">
        {/* Chat Interface */}
        <Card className="flex flex-col h-[500px]">
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                {/* Message Item */}
                <div className="flex gap-3">
                    <Avatar>JP</Avatar>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-sm">
                        <p className="font-bold text-slate-900 mb-1">Juan Pérez <span className="text-xs font-normal text-slate-400">10:15 AM</span></p>
                        <p>Iniciando el desmontaje. La carcasa está muy caliente.</p>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t bg-white flex gap-2">
                <Input placeholder="Escribe una nota o comentario..." />
                <Button size="icon"><Send className="h-4 w-4" /></Button>
            </div>
        </Card>
    </TabsContent>
</Tabs>
```

---

## 5. Inventory & Stock

### 5.1 Spare Parts Catalog (Table View)
**Layout:** Search Bar + DataTable.

```tsx
// Toolbar
<div className="flex justify-between items-center mb-6">
    <div className="flex gap-2 w-full max-w-md">
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input className="pl-9" placeholder="Buscar por referencia, nombre..." />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filtros</Button>
    </div>
    <Button className="bg-emerald-600 hover:bg-emerald-700">
        <Plus className="h-4 w-4 mr-2" /> Nueva Referencia
    </Button>
</div>

// Table
<div className="rounded-md border bg-white">
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Referencia</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow>
                <TableCell className="font-mono text-xs">6204-2Z</TableCell>
                <TableCell>
                    <div className="font-medium">Rodamiento SKF</div>
                    <div className="text-xs text-slate-500">Rodamientos de bolas</div>
                </TableCell>
                <TableCell><Badge variant="outline">A-03-02</Badge></TableCell>
                <TableCell className="text-right">
                    <span className="font-bold text-emerald-600">12</span> <span className="text-xs text-slate-400">u.</span>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Ver</Button>
                </TableCell>
            </TableRow>
            {/* Low Stock Row */}
            <TableRow className="bg-red-50/50">
                 <TableCell className="font-mono text-xs">SN-100</TableCell>
                 <TableCell>Sensor Inductivo</TableCell>
                 <TableCell><Badge variant="outline">B-01</Badge></TableCell>
                 <TableCell className="text-right">
                    <span className="font-bold text-red-600">0</span>
                 </TableCell>
                 <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Pedir</Button>
                 </TableCell>
            </TableRow>
        </TableBody>
    </Table>
</div>
```

### 5.2 Stock Regularization Modal (Dialog)
**Layout:** Modal Overlay -> Content.

```tsx
<Dialog open={isOpen}>
    <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>Regularización de Stock</DialogTitle>
            <DialogDescription>
                Ajuste manual de inventario para <strong>Rodamiento 6204-2Z</strong>.
            </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Stock Sistema</Label>
                    <div className="h-10 px-3 py-2 bg-slate-100 rounded-md text-sm font-mono flex items-center">
                        12
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Stock Físico (Real)</Label>
                    <Input type="number" className="font-bold text-blue-600" placeholder="0" />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label>Motivo del Ajuste</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar motivo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rotura">Rotura / Merma</SelectItem>
                        <SelectItem value="inventario">Conteo Cíclico</SelectItem>
                        <SelectItem value="perdida">Pérdida</SelectItem>
                    </SelectContent>
                </Select>
            </div>

             <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea placeholder="Explica la causa del ajuste..." />
            </div>
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Confirmar Ajuste</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

---

## 6. Mobile Flows (Specifics)

### 6.1 Breakdown Report Wizard (Step-by-Step)
**Layout:** Full Screen with Progress Bar.

```tsx
// Step 1: Asset Selection
<div className="flex flex-col h-screen bg-white">
    <div className="px-4 py-3 border-b flex items-center gap-2">
        <Button variant="ghost" size="icon" className="-ml-2"><ArrowLeft /></Button>
        <span className="font-semibold">Paso 1: ¿Dónde es la avería?</span>
    </div>
    
    <div className="p-4 flex-1">
        <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input className="h-12 pl-10 text-lg" placeholder="Escanear QR o Buscar..." autoFocus />
        </div>

        <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">Sugerencias</h3>
        <div className="grid grid-cols-2 gap-3">
            <button className="p-4 rounded-xl border border-slate-200 text-left hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100">
                <span className="block font-bold text-slate-900">Extrusora A-01</span>
                <span className="text-xs text-slate-500">Línea Extrusión</span>
            </button>
             <button className="p-4 rounded-xl border border-slate-200 text-left hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100">
                <span className="block font-bold text-slate-900">Cinta Salida</span>
                <span className="text-xs text-slate-500">Embalaje</span>
            </button>
        </div>
    </div>
</div>

// Step 2: Symptom Selection (Grid)
<div className="grid grid-cols-2 gap-3 p-4">
    <button className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-slate-100 bg-slate-50 active:border-blue-600 active:bg-blue-50">
        <Flame className="h-8 w-8 text-amber-500" />
        <span className="font-medium text-sm">Humo / Olor</span>
    </button>
    <button className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-slate-100 bg-slate-50 active:border-blue-600 active:bg-blue-50">
        <Volume2 className="h-8 w-8 text-slate-500" />
        <span className="font-medium text-sm">Ruido Extraño</span>
    </button>
    {/* ... */}
</div>
```

---

## 7. Implementation Notes for Developers

1.  **Tailwind Config:** Ensure `slate` is the default gray. Configure `primary` to `blue-600` and `destructive` to `red-600` in `tailwind.config.ts`.
2.  **Shadcn Components:** Install `card`, `button`, `input`, `badge`, `avatar`, `dialog`, `sheet`, `tabs`, `table`, `select`.
3.  **Mobile Height:** Use `h-[100dvh]` (dynamic viewport height) for mobile full-screen layouts to handle browser bars correctly.
4.  **Touch Targets:** Ensure all clickable elements on mobile views have `min-height: 44px` (w-11/h-11).
5.  **Safe Areas:** Add `pb-safe` padding for iOS home indicator on bottom fixed elements.

This specification is ready for direct translation into React code.
