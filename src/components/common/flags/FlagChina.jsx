function FlagChina({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="900" height="600" fill="#de2910" />
      {/* Large star */}
      <polygon
        points="150,100 170,160 230,160 180,200 200,260 150,220 100,260 120,200 70,160 130,160"
        fill="#ffde00"
      />
      {/* Small stars */}
      <g fill="#ffde00">
        <polygon points="270,60 278,85 305,85 283,100 290,125 270,110 250,125 257,100 235,85 262,85" />
        <polygon points="310,120 318,145 345,145 323,160 330,185 310,170 290,185 297,160 275,145 302,145" />
        <polygon points="310,200 318,225 345,225 323,240 330,265 310,250 290,265 297,240 275,225 302,225" />
        <polygon points="270,260 278,285 305,285 283,300 290,325 270,310 250,325 257,300 235,285 262,285" />
      </g>
    </svg>
  );
}

export default FlagChina;
