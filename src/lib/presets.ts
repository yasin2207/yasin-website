export const PRESETS = [
  { src: "/houses/north.jpg", label: "Pool court" },
  { src: "/houses/sea.jpg", label: "White court" },
  { src: "/houses/pali.jpg", label: "Long room" },
  { src: "/houses/nilgiri.jpg", label: "Tree house" },
  { src: "/houses/candolim.jpg", label: "Timber front" },
  { src: "/houses/jubilee.jpg", label: "Night facade" },
  { src: "/houses/colaba.jpg", label: "Walk-up" },
  { src: "/houses/aundh.jpg", label: "Black gate" },
  { src: "/houses/lavelle.jpg", label: "Upper floor" },
  { src: "/houses/kalyani.jpg", label: "Verandah" },
  { src: "/houses/anjuna.jpg", label: "Longhouse" },
  { src: "/houses/boat.jpg", label: "Palm court" },
] as const;

export const PRESET_SRC = new Set<string>(PRESETS.map((preset) => preset.src));
