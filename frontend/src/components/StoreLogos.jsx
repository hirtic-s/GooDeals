// Amazon India logo SVG component
export function AmazonLogo({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text
        x="0" y="22"
        fontFamily="Arial, sans-serif"
        fontWeight="900"
        fontSize="22"
        fill="#131921"
        letterSpacing="-0.5"
      >
        amazon
      </text>
      {/* Smile arrow */}
      <path
        d="M2 27 Q25 34 45 27"
        stroke="#FF9900"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M44 24 L47 27 L42 28" fill="#FF9900" />
      {/* .in suffix */}
      <text
        x="50" y="22"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="14"
        fill="#131921"
      >
        .in
      </text>
    </svg>
  );
}

// Flipkart logo SVG component
export function FlipkartLogo({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 110 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* F logo mark */}
      <rect width="22" height="22" rx="4" fill="#2874F0" y="4" />
      <text
        x="5" y="21"
        fontFamily="Arial, sans-serif"
        fontWeight="900"
        fontSize="18"
        fill="white"
      >
        F
      </text>
      {/* Flipkart text */}
      <text
        x="26" y="21"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="14"
        fill="#2874F0"
      >
        Flipkart
      </text>
    </svg>
  );
}
