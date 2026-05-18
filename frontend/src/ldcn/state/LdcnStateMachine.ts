export type LdcnState =
  | "sleeping"
  | "idle"
  | "waking"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "waiting_confirmation"
  | "executing_action"
  | "success"
  | "warning"
  | "error";

export const LDCN_TRANSITIONS: Record<LdcnState, LdcnState[]> = {
  sleeping: ["waking", "error"],
  idle: ["sleeping", "waking", "listening", "thinking", "warning", "error"],
  waking: ["listening", "error"],
  listening: ["transcribing", "thinking", "speaking", "warning", "error"],
  transcribing: ["thinking", "warning", "error"],
  thinking: ["speaking", "waiting_confirmation", "executing_action", "success", "warning", "error"],
  speaking: ["idle", "listening", "warning", "error"],
  waiting_confirmation: ["executing_action", "thinking", "idle", "warning", "error"],
  executing_action: ["success", "warning", "error"],
  success: ["idle", "sleeping", "waking"],
  warning: ["idle", "sleeping", "thinking", "error"],
  error: ["idle", "sleeping", "waking"],
};

export function canTransitionLdcnState(current: LdcnState, next: LdcnState) {
  if (next === "error") return true;
  return LDCN_TRANSITIONS[current].includes(next);
}

export function transitionLdcnState(current: LdcnState, next: LdcnState): LdcnState {
  if (canTransitionLdcnState(current, next)) {
    return next;
  }
  return current;
}

export function createLdcnStateMachine(initial: LdcnState = "sleeping") {
  let state = initial;
  return {
    getState() {
      return state;
    },
    transition(next: LdcnState) {
      state = transitionLdcnState(state, next);
      return state;
    },
    force(next: LdcnState) {
      state = next;
      return state;
    },
  };
}
