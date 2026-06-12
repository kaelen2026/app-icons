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
  fgMode: "image",
  imageSrc: null,
  text: "A",
  textColor: "#ffffff",
  textFont: "sans",
  iconName: "Rocket",
  iconColor: "#ffffff",
  appName: "My App",
  bgType: "linear",
  bgColor1: "#6366f1",
  bgColor2: "#a855f7",
  shape: "rounded",
  scale: 70,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
};
