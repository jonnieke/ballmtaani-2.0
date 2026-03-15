export const playCoinSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Creates a pleasant 'ding' sound (High C)
    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
    
    // Quick fade out for the 'bell' effect
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};
