"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: ArrayLike<SpeechRecognitionResult>;
}

interface SpeechRecognitionResult extends ArrayLike<{ transcript: string; confidence?: number }> {
  isFinal?: boolean;
}

interface SpeechRecognitionErrorEvent extends Event {
  error?: string;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    webkitAudioContext?: typeof AudioContext;
  }
}

export interface MicrophoneDiagnosticsState {
  isSecureContext: boolean;
  hasMediaDevices: boolean;
  permissionState: PermissionState | "unknown";
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  volumeLevel: number;
  noAudioDetected: boolean;
  streamActive: boolean;
  error: string;
  speechRecognitionSupported: boolean;
  transcript: string;
  interimTranscript: string;
  isRecognizing: boolean;
  startTest: () => Promise<boolean>;
  stopTest: () => void;
  refreshDevices: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  selectDevice: (deviceId: string) => void;
  clearTranscript: () => void;
  selectedDeviceInfo?: MediaDeviceInfo;
}

export interface MicrophoneDiagnosticsOptions {
  onFinalTranscript?: (transcript: string) => void;
}

function friendlySpeechError(error?: string) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Permissao negada. Liberte o microfone no cadeado da URL e tente de novo.";
    case "no-speech":
      return "O navegador capturou audio, mas nao ouviu fala suficiente.";
    case "audio-capture":
      return "Nenhum dispositivo de audio foi encontrado ou ele esta indisponivel.";
    case "network":
      return "O navegador capturou audio, mas o reconhecimento de fala falhou.";
    case "language-not-supported":
      return "O idioma do reconhecimento nao esta suportado neste navegador.";
    default:
      return "O navegador capturou audio, mas o reconhecimento de fala falhou.";
  }
}

export function useMicrophoneDiagnostics(defaultLocale = "pt-BR", options: MicrophoneDiagnosticsOptions = {}): MicrophoneDiagnosticsState {
  const [isSecureContext, setIsSecureContext] = useState(false);
  const [hasMediaDevices, setHasMediaDevices] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState | "unknown">("unknown");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [noAudioDetected, setNoAudioDetected] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState("");
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const transcriptRef = useRef("");
  const selectedDeviceRef = useRef("");
  const audioStartRef = useRef(0);
  const lastAudioRef = useRef(0);
  const finalTranscriptRef = useRef<MicrophoneDiagnosticsOptions["onFinalTranscript"]>(options.onFinalTranscript);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSecureContext(window.isSecureContext);
    setHasMediaDevices(Boolean(navigator.mediaDevices?.getUserMedia));
    setSpeechRecognitionSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    finalTranscriptRef.current = options.onFinalTranscript;
  }, [options.onFinalTranscript]);

  const stopAudioMeter = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyserRef.current = null;
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const stopTest = useCallback(() => {
    activeRef.current = false;
    setIsRecognizing(false);
    setStreamActive(false);
    setNoAudioDetected(false);
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    stopAudioMeter();
  }, [stopAudioMeter]);

  const measureVolume = useCallback(() => {
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
    if (rms > 0.015) {
      lastAudioRef.current = Date.now();
      setNoAudioDetected(false);
    }
    if (Date.now() - audioStartRef.current > 1800 && Date.now() - lastAudioRef.current > 1800) {
      setNoAudioDetected(true);
      setError((current) => current || "O stream de audio esta ativo, mas nao detectei sinal.");
    }
    rafRef.current = window.requestAnimationFrame(measureVolume);
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setDevices([]);
      return;
    }
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = list.filter((device) => device.kind === "audioinput");
      setDevices(audioDevices);
      if (!selectedDeviceRef.current && audioDevices[0]) {
        selectedDeviceRef.current = audioDevices[0].deviceId;
        setSelectedDeviceId(audioDevices[0].deviceId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao consegui listar os dispositivos de audio.");
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined") return false;
    if (!isSecureContext) {
      setError("Este site nao esta em localhost, 127.0.0.1 ou HTTPS. O microfone pode ser bloqueado.");
      return false;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Seu navegador nao suporta captura de audio.");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionState("granted");
      await refreshDevices();
      return true;
    } catch (err) {
      setPermissionState("denied");
      setError("Permissao de microfone negada. Abra o cadeado da URL e permita o microfone.");
      return false;
    }
  }, [isSecureContext, refreshDevices]);

  const startTest = useCallback(async () => {
    if (activeRef.current) {
      stopTest();
    }
    setError("");
    setTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";

    if (!isSecureContext) {
      setError("Abra o app em localhost, 127.0.0.1 ou HTTPS para usar microfone.");
      return false;
    }
    if (!hasMediaDevices) {
      setError("Seu navegador nao suporta getUserMedia.");
      return false;
    }

    const permissionGranted = await requestPermission();
    if (!permissionGranted) {
      return false;
    }

    try {
      const constraints: MediaStreamConstraints = selectedDeviceRef.current
        ? { audio: { deviceId: { exact: selectedDeviceRef.current } } }
        : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!stream.getAudioTracks().length) {
        setError("O navegador abriu o stream, mas nenhum canal de audio veio ativo.");
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }

      streamRef.current = stream;
      setStreamActive(true);
      activeRef.current = true;
      audioStartRef.current = Date.now();
      lastAudioRef.current = Date.now();

      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) {
        setError("AudioContext nao suportado neste navegador.");
        return false;
      }

      const audioContext = new AudioContextCtor();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      setVolumeLevel(0);
      setNoAudioDetected(false);
      measureVolume();

      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        setError("SpeechRecognition nao suportado. O microfone esta ativo, mas a transcricao nao esta disponivel.");
        return true;
      }

      const recognition = new Recognition();
      recognitionRef.current = recognition;
      recognition.lang = defaultLocale;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";
        for (let index = event.results.length - 1; index >= 0; index -= 1) {
          const result = event.results[index];
          const item = result[0];
          if (!item?.transcript) continue;
          if (result.isFinal) {
            finalText = item.transcript.trim();
            break;
          }
          interimText = item.transcript.trim();
        }
        if (finalText) {
          transcriptRef.current = finalText;
          setTranscript(finalText);
          setInterimTranscript("");
          finalTranscriptRef.current?.(finalText);
        } else if (interimText) {
          setInterimTranscript(interimText);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "aborted") return;
        setIsRecognizing(false);
        setError(friendlySpeechError(event.error));
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        stopAudioMeter();
        activeRef.current = false;
      };

      recognition.onend = () => {
        setIsRecognizing(false);
        recognitionRef.current = null;
      };

      try {
        recognition.start();
        setIsRecognizing(true);
        setPermissionState("granted");
        return true;
      } catch {
        setError("Nao consegui iniciar o reconhecimento de fala. O audio foi capturado, mas a transcricao nao iniciou.");
        setIsRecognizing(false);
        recognitionRef.current = null;
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao consegui acessar o microfone.");
      stopTest();
      return false;
    }
  }, [defaultLocale, hasMediaDevices, isSecureContext, measureVolume, requestPermission, stopAudioMeter, stopTest]);

  useEffect(() => {
    return () => {
      stopTest();
    };
  }, [stopTest]);

  const selectedDeviceInfo = useMemo(() => devices.find((device) => device.deviceId === selectedDeviceId), [devices, selectedDeviceId]);

  return {
    isSecureContext,
    hasMediaDevices,
    permissionState,
    devices,
    selectedDeviceId,
    volumeLevel,
    noAudioDetected,
    streamActive,
    error,
    speechRecognitionSupported,
    transcript,
    interimTranscript,
    isRecognizing,
    startTest,
    stopTest,
    refreshDevices,
    requestPermission,
    selectDevice: (deviceId: string) => {
      selectedDeviceRef.current = deviceId;
      setSelectedDeviceId(deviceId);
    },
    clearTranscript: () => {
      transcriptRef.current = "";
      setTranscript("");
      setInterimTranscript("");
    },
    selectedDeviceInfo,
  };
}
