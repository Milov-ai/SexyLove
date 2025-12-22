import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useProposalStore } from "@/store/proposal.store";

export const useEternitySync = () => {
  const { triggerProposal, startSync, startSequence, state } =
    useProposalStore();

  useEffect(() => {
    // Only connect if we are triggered or if we are actively listening (always?)
    // Actually, we want to listen ALWAYS in the background.

    const channel = supabase.channel("romantic-signal", {
      config: {
        presence: {
          key: "milov-device",
        },
      },
    });

    channel
      .on("broadcast", { event: "SIGNAL_INIT" }, (payload) => {
        console.log("🌹 Signal Init received", payload);
        if (state === "IDLE") {
          triggerProposal(); // Prepare system
          // Acknowledge receipt
          channel.send({
            type: "broadcast",
            event: "SIGNAL_ACK",
            payload: { status: "READY" },
          });
        }
      })
      .on("broadcast", { event: "SIGNAL_START" }, (payload) => {
        console.log("🌹 Signal Start received", payload);
        triggerProposal();
        startSequence();
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // console.log('🌹 Application tuned to Romantic Frequency');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state, startSequence, triggerProposal]);

  // Function to broadcast the signal (Master Device)
  const broadcastSignal = async () => {
    startSync();
    // Trigger local playback immediately
    triggerProposal();
    startSequence();

    await supabase.channel("romantic-signal").send({
      type: "broadcast",
      event: "SIGNAL_START",
      payload: { timestamp: Date.now() },
    });
  };

  return { broadcastSignal };
};
