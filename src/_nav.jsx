import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilCamera, cilTruck, cilGrid, cilHistory, cilHome } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Home',
    to: '/dashboard',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'PARQUEADERO',
  },
  {
    component: CNavItem,
    name: 'Vehículos y propietarios',
    to: '/parqueadero/vehiculos',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Puestos',
    to: '/parqueadero/puestos',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Monitoreo de entrada',
    to: '/parqueadero/monitoreo-entrada',
    icon: <CIcon icon={cilCamera} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Historial',
    to: '/parqueadero/historial',
    icon: <CIcon icon={cilHistory} customClassName="nav-icon" />,
  },
]

export default _nav