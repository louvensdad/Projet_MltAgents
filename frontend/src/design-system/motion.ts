export const motionPresets = {
  fadeUp: { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: "easeOut" } },
  scaleIn: { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3, ease: "easeOut" } },
  slideIn: { initial: { opacity: 0, x: 18 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.35, ease: "easeOut" } },
  glowPulse: { animate: { opacity: [0.55, 0.95, 0.55], scale: [1, 1.02, 1] }, transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" } },
  floatingCard: { animate: { y: [0, -6, 0] }, transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" } },
  shimmerBorder: { animate: { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }, transition: { duration: 7, repeat: Infinity, ease: "linear" } },
};

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

