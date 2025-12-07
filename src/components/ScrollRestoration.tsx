import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollRestoration = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    // Не скроллим вверх для страницы чата - там свой скролл
    if (!location.pathname.startsWith('/chat/')) {
      // Всегда скроллим в самый верх при переходе между страницами
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      // Дополнительно скроллим после небольшой задержки для надежности
      const timeout = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [location.pathname, location.search]);

  return null;
};

export default ScrollRestoration;


