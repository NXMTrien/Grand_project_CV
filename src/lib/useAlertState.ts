import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export default function useAlertState<T>(
  initialState: T,
  getMessage: (state: T) => string | null,
  resetAfterAlert = true
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(initialState);
  const mountedRef = useRef(false);
  const configRef = useRef({ initialState, getMessage, resetAfterAlert });

  useEffect(() => {
    configRef.current = { initialState, getMessage, resetAfterAlert };
  }, [getMessage, initialState, resetAfterAlert]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setAlertState = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    if (!mountedRef.current) return;
    const nextState =
      typeof action === "function"
        ? (action as (previousState: T) => T)(stateRef.current)
        : action;
    const {
      initialState: resetState,
      getMessage: resolveMessage,
      resetAfterAlert: shouldReset,
    } = configRef.current;
    const message = resolveMessage(nextState);
    const finalState = message && shouldReset ? resetState : nextState;

    stateRef.current = finalState;
    setState(finalState);
    if (message && typeof window !== "undefined") {
      window.alert(message);
    }
  }, []);

  return [state, setAlertState];
}
