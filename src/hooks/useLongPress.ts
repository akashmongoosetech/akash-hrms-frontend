import { useCallback, useEffect, useRef } from 'react';

interface LongPressOptions {
  /** How long the finger/mouse must stay still before the press counts. */
  delay?: number;
  /** Movement (px) that cancels the press so scrolling stays smooth. */
  movementThreshold?: number;
  onLongPress: (point: { x: number; y: number }) => void;
}

/**
 * Pointer-based long press. It never calls preventDefault on pointer events,
 * so vertical scrolling and native tap behaviour keep working; a press is
 * cancelled as soon as the pointer moves past the threshold.
 */
export function useLongPress({
  delay = 450,
  movementThreshold = 10,
  onLongPress,
}: LongPressOptions) {
  const timerRef = useRef<number | null>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const firedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const start = useCallback(
    (event: React.PointerEvent) => {
      // Only the primary button should arm a long press on desktop.
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      clearTimer();
      firedRef.current = false;
      originRef.current = { x: event.clientX, y: event.clientY };

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        firedRef.current = true;
        onLongPress({ x: originRef.current.x, y: originRef.current.y });
      }, delay);
    },
    [clearTimer, delay, onLongPress],
  );

  const move = useCallback(
    (event: React.PointerEvent) => {
      if (timerRef.current === null) return;
      const dx = Math.abs(event.clientX - originRef.current.x);
      const dy = Math.abs(event.clientY - originRef.current.y);
      if (dx > movementThreshold || dy > movementThreshold) clearTimer();
    },
    [clearTimer, movementThreshold],
  );

  const cancel = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const consumeFired = useCallback(() => {
    const fired = firedRef.current;
    firedRef.current = false;
    return fired;
  }, []);

  return {
    longPressHandlers: {
      onPointerDown: start,
      onPointerMove: move,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
    },
    clearTimer,
    consumeFired,
  };
}
