export function ChefStarburst() {
  return <div className="speech">
  <span className="sr-only">OH, FOR FOOD SAKE!</span>
  <svg viewBox="0 0 330 194" aria-hidden="true">
    <defs>
      <radialGradient id="speech-gold" cx=".48" cy=".43" r=".62">
        <stop stopColor="#fff2ac" />
        <stop offset=".73" stopColor="#ffe170" />
        <stop offset="1" stopColor="#efb72f" />
      </radialGradient>
    </defs>
    <path fill="url(#speech-gold)" stroke="#351708" strokeWidth="4" strokeLinejoin="round"
      d="M5 146 Q37 132 49 120 Q37 111 22 109 Q53 97 35 62 Q82 63 82 24 Q119 48 145 5 Q173 45 210 10 Q228 49 278 24 Q272 67 325 64 Q301 103 325 123 Q283 129 290 164 Q247 143 224 183 Q187 150 151 190 Q121 151 76 175 Q75 156 58 145 Q33 150 5 146Z" />
    <path d="M59 82 Q78 53 116 48 Q79 60 59 82Z" fill="#fff3ba" />
    <g textAnchor="middle" transform="rotate(-5 177 98)">
      <text x="180" y="88" fill="#351708" fontSize="40" textLength="164" lengthAdjust="spacingAndGlyphs">OH, FOR</text>
      <text x="177" y="138" fill="#e01914" stroke="#351708" strokeWidth="4" paintOrder="stroke" fontSize="52"
        textLength="236" lengthAdjust="spacingAndGlyphs">FOOD SAKE!</text>
    </g>
  </svg>
</div>
}
