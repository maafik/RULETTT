import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollRestoration = () => {
  const location = useLocation();
  const positions = useRef<Record<string, number>>({});

  const getStorageKey = () => `${location.pathname}${location.search}`;

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const key = getStorageKey();
    const stored = positions.current[key];
    window.scrollTo({ top: typeof stored === "number" ? stored : 0, left: 0, behavior: "auto" });
  }, [location.key, location.pathname, location.search]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    const key = getStorageKey();
    return () => {
      positions.current[key] = window.scrollY;
    };
  }, [location.key, location.pathname, location.search]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBeforeUnload = () => {
      const key = getStorageKey();
      positions.current[key] = window.scrollY;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [location.key, location.pathname, location.search]);

  return null;
};

export default ScrollRestoration;


