function FlagBrazil({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 720 504"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Green background */}
      <rect width="720" height="504" fill="#009c3b" />
      {/* Yellow diamond */}
      <polygon points="360,40 668,252 360,464 52,252" fill="#ffdf00" />
      {/* Blue circle */}
      <circle cx="360" cy="252" r="140" fill="#002776" />
      {/* White band (simplified) */}
      <path
        d="M235,280 Q360,200 485,280"
        stroke="#fff"
        strokeWidth="25"
        fill="none"
      />
    </svg>
  );
}

export default FlagBrazil;
