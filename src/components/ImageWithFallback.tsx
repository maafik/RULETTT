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
  const [retryCount, setRetryCount] = useState(0);

  // Обновляем imageSrc при изменении src prop
  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    // Пытаемся повторить загрузку один раз (для временных сетевых ошибок)
    if (retryCount < 1 && imageSrc) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Принудительно перезагружаем изображение, добавляя timestamp для обхода кэша
        const separator = imageSrc.includes('?') ? '&' : '?';
        setImageSrc(`${imageSrc}${separator}_retry=${Date.now()}`);
      }, 1000);
      return;
    }
    
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

