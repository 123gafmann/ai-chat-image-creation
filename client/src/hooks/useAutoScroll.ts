import { useEffect, useRef, useState } from "react";

export function useAutoScroll(dependency: unknown) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || userScrolled) return;
    el.scrollTop = el.scrollHeight;
  }, [dependency, userScrolled]);

  function onScroll() {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setUserScrolled(!atBottom);
  }

  return { containerRef, onScroll };
}
