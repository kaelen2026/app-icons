export type IconShape = "rounded" | "circle" | "squircle" | "square";

export type ForegroundMode = "image" | "text" | "icon";

export type TextFont = "sans" | "serif" | "mono";

export type IconConfig = {
  fgMode: ForegroundMode;
  imageSrc: string | null;
  text: string;
  textColor: string;
  textFont: TextFont;
  iconName: string;
  iconColor: string;
  appName: string;
  bgType: "solid" | "linear";
  bgColor1: string;
  bgColor2: string;
  shape: IconShape;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
};

export const defaultIconConfig: IconConfig = {
  fgMode: "icon",
  imageSrc: null,
  text: "A",
  textColor: "#4ade80",
  textFont: "mono",
  iconName: "Rocket",
  iconColor: "#4ade80",
  appName: "my-app",
  bgType: "linear",
  bgColor1: "#1a1a1f",
  bgColor2: "#2e2e36",
  shape: "rounded",
  scale: 62,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
};
