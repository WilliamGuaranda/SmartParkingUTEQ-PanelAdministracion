import React from 'react'
import { CCol, CRow } from '@coreui/react'

import HistorialVehiculos from './HistorialVehiculos'
import HistorialPuestos from './HistorialPuestos'

const Historial = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <HistorialVehiculos />
      </CCol>
      <CCol xs={12}>
        <HistorialPuestos />
      </CCol>
    </CRow>
  )
}

export default Historial
