import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilCamera, cilContact, cilGrid, cilHistory, cilSpeedometer } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Parqueadero',
  },
  {
    component: CNavItem,
    name: 'Vehículo y propietario',
    to: '/parqueadero/vehiculo-propietario',
    icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Puestos',
    to: '/parqueadero/puestos',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Historial',
    to: '/parqueadero/historial',
    icon: <CIcon icon={cilHistory} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Monitoreo de entrada',
    to: '/parqueadero/monitoreo-entrada',
    icon: <CIcon icon={cilCamera} customClassName="nav-icon" />,
  },
]

export default _nav