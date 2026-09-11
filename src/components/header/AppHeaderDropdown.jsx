import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilLockLocked,
  cilSettings,
  cilShieldAlt,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const AppHeaderDropdown = () => {
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        {/* Avatar Institucional UTEQ */}
        <CAvatar
          style={{
            backgroundColor: '#007A33',
            color: '#FFFFFF',
            border: '2px solid #E5A823',
            fontWeight: '800',
            fontSize: '0.8rem',
            letterSpacing: '1px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
          }}
          size="md"
        >
          UTEQ
        </CAvatar>
      </CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          Sesión Garita
        </CDropdownHeader>

        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2 text-success" />
          Operador de Turno
          <CBadge color="success" className="ms-2">
            Activo
          </CBadge>
        </CDropdownItem>

        <CDropdownItem href="#">
          <CIcon icon={cilShieldAlt} className="me-2 text-primary" />
          Nivel de Acceso
          <CBadge color="dark" className="ms-2">
            Garita
          </CBadge>
        </CDropdownItem>

        <CDropdownItem href="#">
          <CIcon icon={cilBell} className="me-2 text-warning" />
          Notificaciones
        </CDropdownItem>

        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
          Sistema
        </CDropdownHeader>

        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Configuración
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem href="#">
          <CIcon icon={cilLockLocked} className="me-2 text-danger" />
          Bloquear / Salir
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown