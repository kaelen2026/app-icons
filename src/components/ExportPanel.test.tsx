import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ExportPanel from "@/components/ExportPanel";

const baseProps = {
  exporting: false,
  completed: [],
  saved: false,
  selected: ["web" as const],
  zipName: "my-app-icons.zip",
  onToggle: vi.fn(),
  onSelectAll: vi.fn(),
  onDownload: vi.fn(),
};

describe("ExportPanel", () => {
  it("toggles platforms and starts a download", async () => {
    const onToggle = vi.fn();
    const onDownload = vi.fn();
    const user = userEvent.setup();

    render(
      <ExportPanel
        {...baseProps}
        onToggle={onToggle}
        onDownload={onDownload}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: /iOS/i }));
    await user.click(screen.getByRole("button", { name: "download .zip" }));

    expect(onToggle).toHaveBeenCalledWith("ios");
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it("shows empty and saved states", () => {
    const { rerender } = render(
      <ExportPanel {...baseProps} selected={[]} zipName="empty-icons.zip" />,
    );

    expect(screen.getByText("no platforms selected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "download .zip" }),
    ).toBeDisabled();

    rerender(<ExportPanel {...baseProps} saved zipName="client-icons.zip" />);

    expect(screen.getByText("client-icons.zip ✓ saved")).toBeInTheDocument();
  });

  it("selects or clears every platform from the select-all control", async () => {
    const onSelectAll = vi.fn();
    const user = userEvent.setup();

    render(
      <ExportPanel {...baseProps} selected={[]} onSelectAll={onSelectAll} />,
    );

    await user.click(screen.getByRole("button", { name: "select all" }));

    expect(onSelectAll).toHaveBeenCalledWith(true);
  });
});
