function FlagPhilippines({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 900 450"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue stripe */}
      <rect width="900" height="225" fill="#0038a8" />
      {/* Red stripe */}
      <rect y="225" width="900" height="225" fill="#ce1126" />
      {/* White triangle */}
      <polygon points="0,0 450,225 0,450" fill="#fff" />
      {/* Sun */}
      <circle cx="150" cy="225" r="45" fill="#fcd116" />
      {/* Sun rays */}
      <g fill="#fcd116">
        <polygon points="150,160 145,180 155,180" />
        <polygon points="150,290 145,270 155,270" />
        <polygon points="85,225 105,220 105,230" />
        <polygon points="215,225 195,220 195,230" />
        <polygon points="104,179 118,192 110,198" />
        <polygon points="196,271 182,258 190,252" />
        <polygon points="104,271 118,258 110,252" />
        <polygon points="196,179 182,192 190,198" />
      </g>
      {/* Three stars */}
      <g fill="#fcd116">
        <polygon points="75,75 80,90 95,90 83,100 88,115 75,105 62,115 67,100 55,90 70,90" />
        <polygon points="75,375 80,360 95,360 83,350 88,335 75,345 62,335 67,350 55,360 70,360" />
        <polygon points="360,225 365,240 380,240 368,250 373,265 360,255 347,265 352,250 340,240 355,240" />
      </g>
    </svg>
  );
}

export default FlagPhilippines;
