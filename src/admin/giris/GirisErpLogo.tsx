/** Sol panel ERP logosu — ERP + Yonetim Paneli tek grafikte */
export function GirisErpLogo() {
  return (
    <svg
      viewBox="0 0 112 96"
      className="erp-giris-sol-erp-logo"
      role="img"
      aria-labelledby="erp-giris-logo-baslik"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="erp-giris-logo-baslik">ERP Yönetim Paneli</title>
      <path d="M4 6h86l6 38H16L4 6Z" fill="url(#erp-logo-govde)" />
      <path d="M16 44 28 70 34 44H16Z" fill="url(#erp-logo-kuyruk)" />
      <path
        d="M4 6h86l6 38H16L4 6Z"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
      <text
        x="50"
        y="30"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="26"
        fontWeight="800"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="0.06em"
      >
        ERP
      </text>
      <text
        x="35"
        y="67"
        textAnchor="start"
        fill="#ffffff"
        fontSize="11.5"
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="0.03em"
      >
        Yönetim Paneli
      </text>
      <defs>
        <linearGradient id="erp-logo-govde" x1="4" y1="6" x2="96" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#94a3b8" />
          <stop offset="1" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="erp-logo-kuyruk" x1="16" y1="44" x2="34" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
