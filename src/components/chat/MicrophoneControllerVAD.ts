import { MicVAD } from "@ricky0123/vad-web";
import { emitter } from "@utils/Emitter";

// MicrophoneControllerVAD.ts
function updateStatus(status: string) {
  const statusLabel = document.getElementById("status-label") as HTMLSpanElement;
  if (statusLabel) statusLabel.textContent = status;
}
export class MicrophoneControllerVAD {
  private vad: MicVAD | null = null;
  public isRunning = false; // <-- público para consultar estado
  private isPausedByUser = false;

  constructor() {
    this.init();
  }

  private async init() {
    this.vad = await MicVAD.new({
      onSpeechStart: () => {
        if (this.isPausedByUser) return;
        updateStatus("listening...");
        this.updateMicIcon("mic");
        emitter.emit("vad:start");
      },
      onSpeechEnd: (audio) => {
        if (this.isPausedByUser) return;
        updateStatus("idle");
        this.updateMicIcon("mic_off");
        emitter.emit("vad:end", {
          buffer: audio,
          timestamp: Date.now(),
        });
      },
      positiveSpeechThreshold: 0.5,
      negativeSpeechThreshold: 0.35,
      redemptionFrames: 8,
      frameSamples: 1536,
      minSpeechFrames: 3,
    });

    //await this.vad.start();
    this.isRunning = false;
    this.updateMicIcon("mic_alert");
  }

  public pause() {
    if (this.vad && this.isRunning) {
      this.vad.pause();
      this.isRunning = false;
      this.isPausedByUser = true;
      this.updateMicIcon("mic_off");
      document.getElementById("status-label")!.textContent = "paused";
    }
  }

  public resume() {
    if (this.vad && !this.isRunning) {
      this.vad.start();
      this.isRunning = true;
      this.isPausedByUser = false;
      this.updateMicIcon("mic");
      document.getElementById("status-label")!.textContent = "idle";
    }
  }

  private updateMicIcon(icon: string) {
    const micIcon = document.getElementById("mic-icon") as HTMLElement;
    console.log("micIcon",micIcon,icon);
    if (micIcon) micIcon.innerText = icon;
  }
}
export default MicrophoneControllerVAD;