import React, { useState } from "react";

interface MesobImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export const MesobImage: React.FC<MesobImageProps> = ({
  src,
  alt,
  className = "",
  fallbackText,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div
        className={`bg-charcoal-900 border border-stone-800 flex flex-col items-center justify-center p-3 text-center select-none ${className}`}
        aria-label={alt}
      >
        <svg
          className="w-8 h-8 text-gold-500/40 mb-1"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v20M2 12h20" />
          <path d="M6 6l12 12M6 18L18 6" />
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
        </svg>
        <span className="text-[10px] text-stone-400 font-display uppercase tracking-wider line-clamp-1">
          {fallbackText || alt || "Mesob"}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-charcoal-900 animate-pulse flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gold-500/30 border-t-gold-400 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        {...props}
      />
    </div>
  );
};
