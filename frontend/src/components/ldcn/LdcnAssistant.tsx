"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import LdcnActionButtons from "@/components/ldcn/LdcnActionButtons";
import LdcnChatPanel from "@/components/ldcn/LdcnChatPanel";
import LdcnFloatingOrb from "@/components/ldcn/LdcnFloatingOrb";
import { useLdcnChat } from "@/ldcn/chat/useLdcnChat";
import { dispatchLdcnAvatarEvent } from "@/components/ldcn/avatar/ldcnAvatarEvents";

export default function LdcnAssistant() {
  const pathname = usePathname();
  const chat = useLdcnChat();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dispatchLdcnAvatarEvent({
        type: "assistant_success",
        message: "Vens acordado e pronto.",
        route: pathname,
        source: "assistant_action",
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handleWakeWord = (event: Event) => {
      const detail = (event as CustomEvent<{ transcript?: string; command?: string }>).detail;
      if (!detail?.transcript) return;
      chat.setOpen(true);
      dispatchLdcnAvatarEvent({
        type: "voice_wake_word",
        message: "Vens acionado.",
        route: pathname,
        source: "wake_word",
      });
      void chat.sendText(detail.command || detail.transcript || "oi");
    };

    window.addEventListener("ldcn:voice-command", handleWakeWord);
    return () => window.removeEventListener("ldcn:voice-command", handleWakeWord);
  }, [chat, pathname]);

  return (
    <>
      <LdcnChatPanel
        open={chat.open}
        messages={chat.messages}
        actions={chat.actions}
        page={chat.page}
        pageTitle={chat.pageTitle}
        stackId={chat.stackId}
        mode={chat.mode}
        busy={chat.busy}
        assistantState={chat.assistantState}
        activeAgent={chat.activeAgent}
        transcript={chat.transcript}
        interimTranscript={chat.interimTranscript}
        volumeLevel={chat.volumeLevel}
        isVoiceSupported={chat.isVoiceSupported}
        voiceError={chat.voiceError}
        permissionState={chat.permissionState}
        noAudioDetected={chat.noAudioDetected}
        textError={chat.textError}
        textOnly={chat.textOnly}
        voiceUnlocked={chat.voiceUnlocked}
        voiceGenderPreference={chat.voiceGenderPreference}
        voiceRate={chat.voiceRate}
        voicePitch={chat.voicePitch}
        voiceVolume={chat.voiceVolume}
        selectedVoiceName={chat.selectedVoiceName}
        availableVoices={chat.availableVoices.map((voice) => ({
          name: voice.name,
          lang: voice.lang,
          label: `${voice.name} (${voice.lang}${voice.default ? ", padrao" : ""})`,
          gender: "unknown",
          default: voice.default,
        }))}
        voiceWarning={chat.voiceWarning}
        canRetry={chat.canRetry}
        onRetry={chat.retryLastMessage}
        onCancel={chat.cancelActiveRequest}
        onVoiceGenderPreferenceChange={chat.setVoiceGenderPreference}
        onVoiceRateChange={chat.setVoiceRate}
        onVoicePitchChange={chat.setVoicePitch}
        onVoiceVolumeChange={chat.setVoiceVolume}
        onSelectedVoiceNameChange={chat.setPreferredVoiceName}
        onTestVoice={() => void chat.testVoice()}
        onUnlockVoice={chat.unlockVoice}
        onSpeakMessage={chat.speakMessage}
        onClose={() => chat.setOpen(false)}
        onSend={chat.sendText}
        onAction={chat.handleAction}
        onStartVoice={chat.startVoice}
        onStopVoice={chat.stopVoice}
        onToggleTextOnly={chat.setTextOnly}
      />
      {!chat.open && chat.actions.length > 0 && (
        <div className="fixed bottom-24 right-5 z-40 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-white/10 bg-slate-950/90 p-3 shadow-xl shadow-black/40 backdrop-blur-xl">
          <LdcnActionButtons actions={chat.actions.slice(0, 2)} onAction={chat.handleAction} />
        </div>
      )}
      <LdcnFloatingOrb state={chat.orbState} open={chat.open} onClick={() => chat.setOpen((value) => !value)} />
    </>
  );
}
