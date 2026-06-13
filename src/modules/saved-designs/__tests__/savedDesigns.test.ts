import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultIconConfig } from "@/types/icon";
import {
  createSavedDesign,
  loadSavedDesigns,
  saveSavedDesigns,
} from "../lib/savedDesigns";

describe("saved designs storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("creates a named snapshot from the current config", () => {
    vi.spyOn(Date, "now").mockReturnValue(123_000);
    vi.spyOn(Math, "random").mockReturnValue(0.123456);

    const design = createSavedDesign({
      ...defaultIconConfig,
      appName: "  Client App  ",
    });

    expect(design).toMatchObject({
      name: "Client App",
      createdAt: 123_000,
      config: expect.objectContaining({ appName: "  Client App  " }),
    });
    expect(design.id).toMatch(/^2mwo-[a-z0-9]{6}$/);
  });

  it("falls back to untitled when saving a blank app name", () => {
    expect(
      createSavedDesign({ ...defaultIconConfig, appName: "  " }).name,
    ).toBe("untitled");
  });

  it("loads only valid saved designs and limits the list", () => {
    const designs = Array.from({ length: 14 }, (_, index) => ({
      id: `id-${index}`,
      name: index === 0 ? "" : `Design ${index}`,
      createdAt: index,
      config: { ...defaultIconConfig, appName: `App ${index}` },
    }));
    localStorage.setItem(
      "app-icons:saved-designs",
      JSON.stringify([...designs, { id: "bad", config: { nope: true } }]),
    );

    const loaded = loadSavedDesigns();

    expect(loaded).toHaveLength(12);
    expect(loaded[0]).toMatchObject({ id: "id-0", name: "App 0" });
    expect(loaded[11]).toMatchObject({ id: "id-11" });
  });

  it("saves at most the newest supported count", () => {
    const designs = Array.from({ length: 14 }, (_, index) => ({
      id: `id-${index}`,
      name: `Design ${index}`,
      createdAt: index,
      config: defaultIconConfig,
    }));

    saveSavedDesigns(designs);

    expect(
      JSON.parse(localStorage.getItem("app-icons:saved-designs") ?? "[]"),
    ).toHaveLength(12);
  });

  it("returns an empty list for malformed storage", () => {
    localStorage.setItem("app-icons:saved-designs", "{");

    expect(loadSavedDesigns()).toEqual([]);
  });
});
