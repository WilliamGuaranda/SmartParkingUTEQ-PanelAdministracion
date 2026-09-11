# UTEQ Smart Parking Panel Administrativo

<img src="public/captura.png" alt="Vista principal del panel administrativo UTEQ Smart Parking" width="100%">

Panel administrativo desarrollado con React, Vite y CoreUI para gestionar y supervisar el flujo del parqueadero universitario UTEQ Smart Parking. El sistema se conecta a Supabase para consultar vehículos autorizados, visualizar ocupación de puestos, revisar historial y ejecutar reconocimiento automático de placas desde imágenes.

## Descripción general

Este proyecto corresponde a un panel de administración para el control de acceso y gestión del estacionamiento de la UTEQ. Integra varias funcionalidades clave para la supervisión operativa del parqueadero:

- Consulta y gestión de vehículos autorizados.
- Visualización de puestos y estado de ocupación.
- Monitoreo de entrada con captura desde cámara o archivo.
- Reconocimiento óptico de caracteres para placas.
- Historial de acciones y cambios del sistema.
- Consulta en tiempo real a través de Supabase y Realtime.

## Funcionalidades implementadas

### 1. Vehículos y propietarios

Ruta principal:

```text
/parqueadero/vehiculos
```

Incluye:

- Listado de vehículos autorizados desde Supabase.
- Búsqueda por placa, marca, modelo, color, propietario o correo.
- Paginación de 10 elementos por página.
- Fotografía del vehículo y del propietario.
- Información del propietario con cédula enmascarada.
- Estado de autorización del vehículo.
- Botón de actualización para recargar datos.
- Acciones de creación, edición y retiro de vehículos cuando corresponda.

### 2. Gestión de puestos

Ruta:

```text
/parqueadero/puestos
```

Incluye:

- Vista del estado de cada puesto del parqueadero.
- Conteo total, libres, ocupados y porcentaje de disponibilidad.
- Filtros por estado y columna.
- Creación, edición y eliminación de puestos.
- Marcado de puestos como ocupados o disponibles.
- Visualización del estado operativo en tiempo real.

### 3. Monitoreo de entrada

Ruta:

```text
/parqueadero/monitoreo-entrada
```

Incluye:

- Captura de imagen desde cámara o selección local.
- Validación de archivos antes del proceso.
- Envío de la imagen al servicio OCR configurado.
- Reconocimiento automático de la placa.
- Visualización del resultado con la imagen marcada.
- Manejo de errores y mensajes de validación.

### 4. Historial de cambios

Ruta:

```text
/parqueadero/historial
```

Incluye:

- Historial de vehículos.
- Historial de puestos.
- Auditoría de modificaciones realizadas en el sistema.

## Tecnologías utilizadas

- React 19
- Vite
- CoreUI React
- Supabase JavaScript Client
- Sass
- JavaScript ES modules

## Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto con las variables necesarias:

```dotenv
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica
VITE_OCR_ENDPOINT=https://tu-endpoint-ocr.example.com/api/reconocer
```

Importante:

- No publicar claves secretas ni la clave `service_role`.
- Mantener `.env.local` fuera del control de versiones.
- El servicio OCR debe estar configurado para la funcionalidad de monitoreo de entrada.

## Instalación y ejecución

Instalar dependencias:

```powershell
npm install
```

Ejecutar la aplicación en modo desarrollo:

```powershell
npm start
```

Abrir la aplicación en el navegador:

```text
http://localhost:5173
```

Rutas relevantes:

```text
http://localhost:5173/dashboard
http://localhost:5173/parqueadero/vehiculos
http://localhost:5173/parqueadero/puestos
http://localhost:5173/parqueadero/monitoreo-entrada
http://localhost:5173/parqueadero/historial
```

Generar compilación para producción:

```powershell
npm run build
```

## Estructura principal del proyecto

```text
src/
├── _nav.jsx                         # Menú lateral del panel
├── routes.js                        # Definición de rutas
├── lib/
│   └── supabase.js                  # Cliente Supabase
├── hooks/
│   ├── useVehiculos.js              # Consulta de vehículos
│   ├── usePuestos.js                # Gestión de puestos
│   ├── useHistorial.js              # Historial del sistema
│   └── useCamera.js                 # Captura de cámara
├── services/
│   └── ocrService.js                # Integración OCR
├── views/
│   └── parqueadero/
│       ├── ListaVehiculos.jsx       # Vista de vehículos
│       ├── Puestos.jsx              # Vista de puestos
│       ├── MonitoreoEntrada.jsx     # Captura y OCR
│       └── Historial.jsx           # Historial general
├── components/
│   └── ...
├── assets/
└── scss/
```

## Galería de pantallas

Las siguientes capturas corresponden a la funcionalidad principal del sistema y se encuentran en la carpeta `public` del proyecto.

<div align="center">
  <img src="public/1.jpeg" alt="Pantalla 1" width="32%" />
  <img src="public/2.jpeg" alt="Pantalla 2" width="32%" />
  <img src="public/3.jpeg" alt="Pantalla 3" width="32%" />
</div>

<div align="center">
  <img src="public/4.jpeg" alt="Pantalla 4" width="32%" />
  <img src="public/5.jpeg" alt="Pantalla 5" width="32%" />
  <img src="public/6.jpeg" alt="Pantalla 6" width="32%" />
</div>

<div align="center">
  <img src="public/7.jpeg" alt="Pantalla 7" width="32%" />
  <img src="public/8.jpeg" alt="Pantalla 8" width="32%" />
  <img src="public/9.jpeg" alt="Pantalla 9" width="32%" />
</div>

## Flujo de trabajo del sistema

1. El panel consulta los datos de vehículos y puestos desde Supabase.
2. Los administradores pueden filtrar, buscar y revisar información detallada.
3. El módulo de puestos refleja el estado actual del estacionamiento.
4. La cámara o un archivo cargado permiten reconocer placas mediante OCR.
5. El historial conserva un registro de cambios relevantes para auditoría.

## Verificación funcional

Con el entorno configurado y las tablas correspondientes en Supabase, se puede comprobar que:

1. Se cargan los vehículos autorizados correctamente.
2. Los datos del propietario y del vehículo se visualizan en la tabla.
3. Los puestos muestran su estado real y disponibilidad.
4. La captura de imágenes funciona desde cámara o archivo.
5. El OCR reconoce placas y devuelve la información esperada.
6. El historial refleja los cambios realizados en el sistema.
7. La aplicación puede ejecutarse desde el entorno de desarrollo con Vite.

## Nota

Este panel fue desarrollado como solución administrativa para supervisar y gestionar un sistema de estacionamiento inteligente, combinando consultas en tiempo real, monitoreo visual y procesamiento OCR para apoyar la operación del parqueadero.
