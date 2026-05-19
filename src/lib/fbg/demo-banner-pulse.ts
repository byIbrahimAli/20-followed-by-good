export const DEMO_BANNER_PULSE_EVENT = "fbg-demo-pulse";

export const pulseDemoBanner = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(DEMO_BANNER_PULSE_EVENT));
};
