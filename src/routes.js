import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const ListaVehiculos = React.lazy(() => import('./views/parqueadero/ListaVehiculos'))
const ListaPuestos = React.lazy(() => import('./views/parqueadero/ListaPuestos'))
const Historial = React.lazy(() => import('./views/parqueadero/Historial'))
const MonitoreoEntrada = React.lazy(() => import('./views/parqueadero/MonitoreoEntrada'))

// ... resto de imports de components/forms/icons (los del template)

export const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  {
    path: '/parqueadero/vehiculo-propietario',
    name: 'Vehículo y propietario',
    element: ListaVehiculos,
  },
  { path: '/parqueadero/puestos', name: 'Puestos', element: ListaPuestos },
  { path: '/parqueadero/historial', name: 'Historial', element: Historial },
  {
    path: '/parqueadero/monitoreo-entrada',
    name: 'Monitoreo de entrada',
    element: MonitoreoEntrada,
  },
  // ... el resto de rutas del template
]

export default routes