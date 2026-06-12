import { afterEach, describe, expect, it, vi } from "vitest";
import { presetPatch, randomStylePatch, stylePresets } from "@/lib/presets";

describe("style presets", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("applies the preset background and foreground colors together", () => {
    expect(presetPatch(stylePresets[0])).toEqual({
      ...stylePresets[0].patch,
      iconColor: stylePresets[0].fgColor,
      textColor: stylePresets[0].fgColor,
    });
  });

  it("builds a random icon-mode patch from curated options", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(randomStylePatch()).toMatchObject({
      ...stylePresets[0].patch,
      iconColor: stylePresets[0].fgColor,
      textColor: stylePresets[0].fgColor,
      fgMode: "icon",
      iconName: "Rocket",
      shape: "rounded",
    });
  });
});
