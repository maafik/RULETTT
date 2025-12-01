import { useState, useEffect } from "react";

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  fallbackText?: string;
  className?: string;
  onError?: () => void;
}

const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackText, 
  className = "", 
  onError 
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // Обновляем imageSrc при изменении src prop
  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(undefined);
      onError?.();
    }
  };

  // Если нет src или произошла ошибка, показываем fallback
  if (!imageSrc || hasError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 ${className}`}>
        {fallbackText ? (
          <span className="text-2xl font-bold text-muted-foreground">
            {fallbackText}
          </span>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">
              {alt.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default ImageWithFallback;

