import { useRef, useCallback } from "react";
import { useChatContext } from "../store/ChatContext";
import { createImage } from "../api/imageApi";

export function useImageCreate() {
  const { state, dispatch } = useChatContext();
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (prompt: string) => {
      if (state.isStreaming) return;

      dispatch({ type: "ADD_USER_MESSAGE", content: prompt });
      dispatch({ type: "ADD_ASSISTANT_STUB", id: crypto.randomUUID() });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const imageUrl = await createImage(prompt, controller.signal);
        dispatch({ type: "SET_IMAGE_RESULT", imageUrl });
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          dispatch({ type: "SET_COMPLETE" });
        } else {
          dispatch({ type: "SET_ERROR", message: (err as Error).message });
        }
      } finally {
        abortRef.current = null;
      }
    },
    [state.isStreaming, dispatch]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { generate, abort };
}
