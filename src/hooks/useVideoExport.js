import html2canvas from "html2canvas";
import { useCallback, useRef, useState } from "react";

/**
 * Hook that records a MARP presentation slide-by-slide as a .webm video.
 *
 * Usage:
 *   const { startRecording, stopRecording, isRecording, progress } = useVideoExport();
 *   await startRecording(marpRef, { secondsPerSlide: 3, fps: 24, width: 1280, height: 720 });
 *
 * `marpRef` must expose `{ container, goTo, totalSlides }` via useImperativeHandle (MarpPreview).
 */
export function useVideoExport() {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1
  const stopRef = useRef(false);

  const stopRecording = useCallback(() => {
    stopRef.current = true;
  }, []);

  const startRecording = useCallback(
    async (
      marpRef,
      {
        secondsPerSlide = 3,
        fps = 24,
        width = 1280,
        height = 720,
        filename = "presentation.webm",
        onProgress,
      } = {}
    ) => {
      if (!marpRef?.current) {
        throw new Error("MarpPreview ref is not attached");
      }

      if (!window.MediaRecorder) {
        throw new Error(
          "MediaRecorder is not supported in this browser. Please use Chrome or Edge."
        );
      }

      const { goTo, totalSlides } = marpRef.current;
      if (!totalSlides || totalSlides === 0) {
        throw new Error("No slides to record");
      }

      stopRef.current = false;
      setIsRecording(true);
      setProgress(0);

      // Set up offscreen canvas that drives the MediaRecorder
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const stream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.start(100); // collect chunks every 100 ms

      const msPerFrame = 1000 / fps;
      const framesPerSlide = Math.round(secondsPerSlide * fps);

      try {
        for (let slideIdx = 0; slideIdx < totalSlides; slideIdx++) {
          if (stopRef.current) break;

          // Advance the preview to this slide
          goTo(slideIdx);

          // Small settle delay so React can re-render and images can load
          await new Promise((r) => setTimeout(r, 350));

          if (stopRef.current) break;

          // Capture this slide once with html2canvas
          const slideEl = marpRef.current.container?.querySelector(
            ".w-full.max-w-3xl"
          );
          const captureTarget = slideEl || marpRef.current.container;

          let slideCanvas;
          try {
            slideCanvas = await html2canvas(captureTarget, {
              scale: width / (captureTarget.offsetWidth || 960),
              useCORS: true,
              allowTaint: false,
              backgroundColor: "#ffffff",
              logging: false,
              width: captureTarget.offsetWidth,
              height: captureTarget.offsetHeight,
            });
          } catch {
            // If html2canvas fails for a slide, draw a blank frame
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#ffffff";
            ctx.font = `${Math.round(height / 20)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(`Slide ${slideIdx + 1}`, width / 2, height / 2);
            slideCanvas = canvas;
          }

          // Push the captured frame for the configured number of video frames
          for (let f = 0; f < framesPerSlide; f++) {
            if (stopRef.current) break;
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(slideCanvas, 0, 0, width, height);
            // Wait one frame interval so the canvas stream encoder picks it up
            await new Promise((r) => setTimeout(r, msPerFrame));
          }

          const slideProgress = (slideIdx + 1) / totalSlides;
          setProgress(slideProgress);
          onProgress?.(slideProgress);
        }
      } finally {
        recorder.stop();
        // Reset to first slide
        goTo(0);
      }

      // Wait for recorder to finish flushing
      await new Promise((resolve) => {
        recorder.onstop = resolve;
      });

      setIsRecording(false);
      setProgress(1);

      if (chunks.length === 0) return;

      // Trigger download
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    []
  );

  return { startRecording, stopRecording, isRecording, progress };
}
