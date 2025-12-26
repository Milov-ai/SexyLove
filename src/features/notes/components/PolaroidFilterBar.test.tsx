// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { PolaroidFilterBar } from "./PolaroidFilterBar";
import type { Block } from "@/store/notes.store";

expect.extend(matchers); // Extend vitest expect with jest-dom matchers

// Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock dependencies
vi.mock("@/components/ui/collapsible", () => ({
  Collapsible: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (
    <div data-testid="collapsible" data-open={open}>
      {children}
    </div>
  ),
  CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => (
    <div role="button">{children}</div>
  ),
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div role="button">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <div onClick={onClick} role="menuitem">
      {children}
    </div>
  ),
}));

describe("PolaroidFilterBar", () => {
  const mockBlocks: Block[] = [
    {
      id: "1",
      type: "cine_polaroid",
      content: "",
      props: { genre: "Horror", year: "1980" },
    },
  ];

  const mockFilterState = {
    searchQuery: "",
    selectedGenre: "all",
    selectedYear: "all",
    selectedDirector: "all",
    watchedStatus: "all" as const,
    minRating: 0,
  };

  it("renders when cine_polaroid blocks are present", () => {
    render(
      <PolaroidFilterBar
        blocks={mockBlocks}
        filters={mockFilterState}
        onFilterChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Polaroid Filters")).toBeInTheDocument();
  });

  it("does not render when no cine_polaroid blocks are present", () => {
    const { container } = render(
      <PolaroidFilterBar
        blocks={[]}
        filters={mockFilterState}
        onFilterChange={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders filter controls when expanded", () => {
    render(
      <PolaroidFilterBar
        blocks={mockBlocks}
        filters={mockFilterState}
        onFilterChange={vi.fn()}
      />,
    );
    // Check for always visible content
    expect(screen.getByText("1/1 Vistas")).toBeInTheDocument();
  });
});
