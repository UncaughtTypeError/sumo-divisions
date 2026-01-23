function FlagEgypt({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="900" height="200" fill="#ce1126" />
      <rect y="200" width="900" height="200" fill="#fff" />
      <rect y="400" width="900" height="200" fill="#000" />
      {/* Eagle of Saladin (simplified) */}
      <g fill="#c09300">
        <ellipse cx="450" cy="300" rx="50" ry="40" />
        <path d="M410,290 L400,250 L450,270 L500,250 L490,290 Z" />
        <rect x="440" y="330" width="20" height="30" />
      </g>
    </svg>
  );
}

export default FlagEgypt;
