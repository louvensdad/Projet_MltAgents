"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AudioPermissionState = PermissionState | "unknown";

interface UseAudioLevelOptions {
  threshold?: number;
}

export function useAudioLevel(options: UseAudioLevelOptions = {}) {
  const threshold = options.threshold ?? 0.015;
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [permissionState, setPermissionState] = useState<AudioPermissionState>("unknown");
  const [error, setError] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [noAudioDetected, setNoAudioDetected] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const lastAudioAtRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSupported(Boolean(navigator.mediaDevices?.getUserMedia));
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          setPermissionState(status.state);
          status.onchange = () => setPermissionState(status.state);
        })
        .catch(() => setPermissionState("unknown"));
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    activeRef.current = false;
    setNoAudioDetected(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const loop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser || !activeRef.current) return;

    const buffer = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buffer);
    let sum = 0;
    for (let index = 0; index < buffer.length; index += 1) {
      const normalized = (buffer[index] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / buffer.length);
    const level = Math.max(0, Math.min(100, Math.round(rms * 300)));
    setVolumeLevel(level);

    const now = Date.now();
    if (rms > threshold) {
      lastAudioAtRef.current = now;
      setHasAudio(true);
      setNoAudioDetected(false);
    } else if (startedAtRef.current && now - startedAtRef.current > 1400 && now - lastAudioAtRef.current > 1400) {
      setNoAudioDetected(true);
    }

    rafRef.current = window.requestAnimationFrame(loop);
  }, [threshold]);

  const startMonitoring = useCallback(async () => {
    if (!isSupported || typeof window === "undefined") {
      setError("Seu navegador nao permite testar o microfone.");
      return false;
    }
    if (activeRef.current) return true;

    try {
      setError("");
      setNoAudioDetected(false);
      setHasAudio(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionState("granted");
      const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        setError("AudioContext indisponivel neste navegador.");
        stopMonitoring();
        return false;
      }
      const audioContext = new AudioContextCtor();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      startedAtRef.current = Date.now();
      lastAudioAtRef.current = 0;
      activeRef.current = true;
      loop();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao consegui acessar o microfone.";
      setError(message);
      setPermissionState("denied");
      stopMonitoring();
      return false;
    }
  }, [isSupported, loop, stopMonitoring]);

  useEffect(() => {
    return () => stopMonitoring();
  }, [stopMonitoring]);

  return {
    startMonitoring,
    stopMonitoring,
    volumeLevel,
    hasAudio,
    noAudioDetected,
    permissionState,
    isSupported,
    error,
    setError,
  };
}
