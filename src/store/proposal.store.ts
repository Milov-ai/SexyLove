import { create } from "zustand";

export type ProposalState =
  | "IDLE"
  | "PRIMED"
  | "SYNCING"
  | "PLAYING"
  | "ACCEPTED";

interface ProposalStore {
  state: ProposalState;
  targetName: string;
  isTriggered: boolean;

  // Actions
  triggerProposal: () => void;
  startSync: () => void;
  startSequence: () => void;
  acceptProposal: () => void;
  reset: () => void;
}

export const useProposalStore = create<ProposalStore>((set) => ({
  state: "IDLE",
  targetName: "Estrellita",
  isTriggered: false,

  triggerProposal: () => set({ state: "PRIMED", isTriggered: true }),
  startSync: () => set({ state: "SYNCING" }),
  startSequence: () => set({ state: "PLAYING" }),
  acceptProposal: () => set({ state: "ACCEPTED" }),
  reset: () => set({ state: "IDLE", isTriggered: false }),
}));
