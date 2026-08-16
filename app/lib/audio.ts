
export const playNotificationSound = () => {
  // Use a default sound or the user's uploaded one
  const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
  audio.play().catch((e) => console.error("Audio playback failed:", e));
};

export const playCardSound = () => {
  const audio = new Audio("https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg");
  audio.play().catch((e) => console.error("Card audio playback failed:", e));
};
