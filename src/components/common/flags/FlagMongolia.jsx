function FlagMongolia({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="300" height="600" fill="#c4272f" />
      <rect x="300" width="300" height="600" fill="#015197" />
      <rect x="600" width="300" height="600" fill="#c4272f" />
      {/* Soyombo symbol (simplified) */}
      <g fill="#f9cf02">
        {/* Flame */}
        <path d="M150,120 L150,100 L140,110 L150,90 L160,110 Z" />
        {/* Sun */}
        <circle cx="150" cy="145" r="20" />
        {/* Moon */}
        <path d="M130,180 Q150,160 170,180 Q150,200 130,180 Z" />
        {/* Rectangles */}
        <rect x="135" y="200" width="30" height="60" />
        <rect x="125" y="270" width="50" height="20" />
        {/* Yin Yang simplified */}
        <circle cx="150" cy="320" r="25" />
        <rect x="125" y="355" width="50" height="20" />
        <rect x="135" y="385" width="30" height="80" />
        {/* Triangles */}
        <path d="M125,475 L150,495 L175,475 Z" />
        <path d="M125,505 L150,525 L175,505 Z" />
      </g>
    </svg>
  );
}

export default FlagMongolia;
