type ColorKey = keyof typeof COLOR_MAP;

export const COLOR_MAP = {
  amber: '#fbbf24',
  background: '#f3f3f3',
  blue: '#3b82f6',
  cyan: '#22d3ee',
  emerald: '#34d399',
  fuchsia: '#e879f9',
  gray: '#9ca3af',
  green: '#4ade80',
  indigo: '#818cf8',
  lime: '#a3e635',
  orange: '#fb923c',
  pink: '#f472b6',
  purple: '#a78bfa',
  red: '#f87171',
  rose: '#fb7185',
  sky: '#0ea5e9',
  teal: '#2dd4bf',
  yellow: '#facc15'
};
export const COLOR_LIST = Object.values(COLOR_MAP);

export const getColorList = (...exclude: ColorKey[]) =>
  Object.entries(COLOR_MAP).reduce(
    (acc: string[], [key, color]) => exclude.includes(key as ColorKey) ? acc : [...acc, color],
    []
  );

export const hexToRgb = (hex: string): string => {
  const bigint = Number.parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
};
