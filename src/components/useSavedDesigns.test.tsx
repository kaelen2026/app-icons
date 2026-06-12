import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useSavedDesigns } from "@/components/useSavedDesigns";
import { defaultIconConfig } from "@/types/icon";

describe("useSavedDesigns", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves current config and deletes saved designs", () => {
    const { result } = renderHook(() => useSavedDesigns());

    act(() => result.current.saveDesign(defaultIconConfig));
    expect(result.current.savedDesigns).toHaveLength(1);
    expect(result.current.savedDesigns[0]?.name).toBe(
      defaultIconConfig.appName,
    );

    const id = result.current.savedDesigns[0]?.id;
    if (!id) throw new Error("saved design id missing");
    act(() => result.current.deleteDesign(id));
    expect(result.current.savedDesigns).toEqual([]);
  });
});
