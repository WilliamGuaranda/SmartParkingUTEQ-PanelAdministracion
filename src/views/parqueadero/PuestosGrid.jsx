import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { CBadge, CTooltip } from '@coreui/react'

const colorFondoEstado = (estado) => {
  const valor = (estado || '').toUpperCase()
  if (valor === 'DISPONIBLE') return 'var(--cui-success)'
  if (valor === 'OCUPADO') return 'var(--cui-danger)'
  return 'var(--cui-warning)'
}

const PuestosGrid = ({ puestos, onSeleccionar }) => {
  const columnas = useMemo(() => {
    const grupos = {}

    puestos.forEach((puesto) => {
      const clave = puesto.columna || '—'
      if (!grupos[clave]) grupos[clave] = []
      grupos[clave].push(puesto)
    })

    Object.values(grupos).forEach((lista) =>
      lista.sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0)),
    )

    return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b))
  }, [puestos])

  if (puestos.length === 0) {
    return <div className="text-center py-5 text-body-secondary">No hay puestos para mostrar.</div>
  }

  return (
    <div className="d-flex flex-column gap-4">
      {columnas.map(([columna, lista]) => (
        <div key={columna}>
          <div className="small text-body-secondary mb-2">Columna {columna}</div>
          <div className="d-flex flex-wrap gap-2">
            {lista.map((puesto) => (
              <CTooltip
                key={puesto.id}
                content={
                  <>
                    <div>
                      <strong>{puesto.codigo}</strong>
                    </div>
                    <div className="text-capitalize">{puesto.estado?.toLowerCase()}</div>
                    {puesto.distancia_cm != null && <div>{puesto.distancia_cm} cm</div>}
                  </>
                }
              >
                <button
                  type="button"
                  onClick={() => onSeleccionar(puesto)}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: colorFondoEstado(puesto.estado),
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <span style={{ fontSize: '0.95rem' }}>{puesto.codigo}</span>
                  <span style={{ fontSize: '0.65rem' }}>#{puesto.numero}</span>
                </button>
              </CTooltip>
            ))}
          </div>
        </div>
      ))}

      <div className="d-flex gap-3 mt-2">
        <div className="d-flex align-items-center gap-2">
          <CBadge style={{ backgroundColor: 'var(--cui-success)', width: '14px', height: '14px' }}>
            {' '}
          </CBadge>
          <small>Disponible</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <CBadge style={{ backgroundColor: 'var(--cui-danger)', width: '14px', height: '14px' }}>
            {' '}
          </CBadge>
          <small>Ocupado</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <CBadge style={{ backgroundColor: 'var(--cui-warning)', width: '14px', height: '14px' }}>
            {' '}
          </CBadge>
          <small>Mantenimiento</small>
        </div>
      </div>
    </div>
  )
}

PuestosGrid.propTypes = {
  puestos: PropTypes.array.isRequired,
  onSeleccionar: PropTypes.func.isRequired,
}

export default PuestosGrid