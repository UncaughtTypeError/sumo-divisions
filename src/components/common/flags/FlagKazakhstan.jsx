function FlagKazakhstan({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="900" height="600" fill="#00afca" />
      {/* National pattern on left */}
      <rect x="0" y="0" width="50" height="600" fill="#fec50c" />
      {/* Sun with rays */}
      <g fill="#fec50c">
        <circle cx="450" cy="250" r="70" />
        {/* Rays */}
        <path d="M450,150 L455,170 L445,170 Z" />
        <path d="M450,350 L455,330 L445,330 Z" />
        <path d="M350,250 L370,255 L370,245 Z" />
        <path d="M550,250 L530,255 L530,245 Z" />
        <path d="M380,180 L395,195 L385,200 Z" />
        <path d="M520,320 L505,305 L515,300 Z" />
        <path d="M380,320 L395,305 L385,300 Z" />
        <path d="M520,180 L505,195 L515,200 Z" />
      </g>
      {/* Eagle (simplified) */}
      <path
        d="M400,380 Q450,350 500,380 Q480,420 450,400 Q420,420 400,380 Z"
        fill="#fec50c"
      />
    </svg>
  );
}

export default FlagKazakhstan;
