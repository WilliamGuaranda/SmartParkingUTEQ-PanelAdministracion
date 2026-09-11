import React from 'react'

const Logo = ({
  width = 599,
  height = 116,
  className = '',
  title = 'UTEQ — Parqueadero Institucional',
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 599 116"
    width={width}
    height={height}
    className={className}
    role="img"
    aria-label={title}
    {...props}
  >
    <title>{title}</title>

    <g fill="none" fillRule="evenodd">
      {/* --- Isotipo Institucional Escudo UTEQ --- */}
      <rect x="8" y="10" width="96" height="96" rx="22" fill="#007A33" />
      
      {/* Borde sutil dorado institucional */}
      <rect
        x="12"
        y="14"
        width="88"
        height="88"
        rx="18"
        stroke="#E5A823"
        strokeWidth="2.5"
        strokeOpacity="0.85"
      />

      {/* Monograma UTEQ en el emblema */}
      <text
        x="56"
        y="68"
        fill="#FFFFFF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="29"
        fontWeight="900"
        letterSpacing="2.5"
        textAnchor="middle"
      >
        UTEQ
      </text>

      {/* Detalle inferior: barra dorada con punto de estado */}
      <rect x="36" y="78" width="40" height="3" rx="1.5" fill="#E5A823" />

      {/* --- Tipografía y Jerarquía Institucional --- */}
      <g fontFamily="Arial, Helvetica, sans-serif">
        {/* Titular Principal: UTEQ */}
        <text
          x="126"
          y="54"
          fill="#007A33"
          fontSize="40"
          fontWeight="900"
          letterSpacing="2.5"
        >
          UTEQ
        </text>

        {/* Separador vertical */}
        <rect
          x="264"
          y="24"
          width="2"
          height="34"
          rx="1"
          fill="currentColor"
          opacity="0.2"
        />

        {/* Módulo PARKING */}
        <text
          x="280"
          y="54"
          fill="currentColor"
          fontSize="36"
          fontWeight="800"
          letterSpacing="1.8"
        >
          PARKING
        </text>

        {/* Badge Institucional y Leyenda Inferior */}
        <rect x="126" y="70" width="96" height="24" rx="5" fill="#E5A823" />
        <text
          x="174"
          y="87"
          fill="#1e293b"
          fontSize="11.5"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="1"
        >
          CAMPUS
        </text>

        <text
          x="234"
          y="87"
          fill="currentColor"
          opacity="0.75"
          fontSize="13.5"
          fontWeight="700"
          letterSpacing="1.2"
        >
          CONTROL DE ACCESO VEHICULAR
        </text>
      </g>
    </g>
  </svg>
)

export { Logo }
export default Logo