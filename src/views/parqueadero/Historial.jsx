import React, { useState } from 'react'
import { CCard, CCardBody, CTab, CTabContent, CTabList, CTabPane, CTabs } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCarAlt, cilGrid, cilHistory } from '@coreui/icons'

import HistorialVehiculos from './HistorialVehiculos'
import HistorialPuestos from './HistorialPuestos'

/**
 * Vista "Historial": muestra en pestañas el registro de cambios de
 * vehículos y de puestos del parqueadero.
 */
const Historial = () => {
  const [tabActiva, setTabActiva] = useState('vehiculos')

  return (
    <CCard className="mb-4">
      <CCardBody>
        <div className="d-flex align-items-center gap-2 mb-3">
          <CIcon icon={cilHistory} size="xl" className="text-success" />
          <div>
            <h4 className="mb-0 fw-semibold">Historial de cambios</h4>
            <div className="small text-body-secondary">
              Auditoría de todas las modificaciones registradas en el sistema
            </div>
          </div>
        </div>

        <CTabs activeItemKey={tabActiva} onChange={setTabActiva}>
          <CTabList variant="tabs" className="mb-3">
            <CTab itemKey="vehiculos">
              <CIcon icon={cilCarAlt} className="me-2" />
              Vehículos
            </CTab>
            <CTab itemKey="puestos">
              <CIcon icon={cilGrid} className="me-2" />
              Puestos
            </CTab>
          </CTabList>

          <CTabContent>
            <CTabPane role="tabpanel" aria-labelledby="vehiculos-tab" visible={tabActiva === 'vehiculos'}>
              <HistorialVehiculos />
            </CTabPane>
            <CTabPane role="tabpanel" aria-labelledby="puestos-tab" visible={tabActiva === 'puestos'}>
              <HistorialPuestos />
            </CTabPane>
          </CTabContent>
        </CTabs>
      </CCardBody>
    </CCard>
  )
}

export default Historial