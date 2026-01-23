function FlagGeorgia({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="900" height="600" fill="#fff" />
      {/* Central cross */}
      <rect x="360" width="180" height="600" fill="#ff0000" />
      <rect y="210" width="900" height="180" fill="#ff0000" />
      {/* Four smaller crosses */}
      <g fill="#ff0000">
        {/* Top-left */}
        <rect x="150" y="60" width="60" height="120" />
        <rect x="120" y="90" width="120" height="60" />
        {/* Top-right */}
        <rect x="690" y="60" width="60" height="120" />
        <rect x="660" y="90" width="120" height="60" />
        {/* Bottom-left */}
        <rect x="150" y="420" width="60" height="120" />
        <rect x="120" y="450" width="120" height="60" />
        {/* Bottom-right */}
        <rect x="690" y="420" width="60" height="120" />
        <rect x="660" y="450" width="120" height="60" />
      </g>
    </svg>
  );
}

export default FlagGeorgia;
