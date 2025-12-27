import { describe, it, expect } from "vitest";
import { updateBlockInTree } from "./tree-utils";
import type { Block } from "@/store/notes.store";

describe("tree-utils structural sharing", () => {
  it("preserves object identity for unchanged siblings", () => {
    const tree: Block[] = [
      { id: "1", type: "text", content: "Block 1", children: [] },
      { id: "2", type: "text", content: "Block 2", children: [] }, // Target
      { id: "3", type: "text", content: "Block 3", children: [] },
    ];

    const newTree = updateBlockInTree(tree, "2", { content: "Updated" });

    // 1. Root array should be new
    expect(newTree).not.toBe(tree);

    // 2. Block 1 (sibling) should be SAME reference
    expect(newTree[0]).toBe(tree[0]);

    // 3. Block 2 (target) should be NEW reference
    expect(newTree[1]).not.toBe(tree[1]);
    expect(newTree[1].content).toBe("Updated");
    expect(newTree[1].children).toBeDefined();

    // 4. Block 3 (sibling) should be SAME reference
    expect(newTree[2]).toBe(tree[2]);
  });

  it("preserves object identity for siblings in deep tree", () => {
      const tree: Block[] = [
        {
           id: "root",
           type: "text",
           content: "Root",
           children: [
               { id: "c1", type: "text", content: "Child 1" }, // Sibling
               { id: "c2", type: "text", content: "Child 2" }  // Target
           ]
        }
      ];

      const newTree = updateBlockInTree(tree, "c2", { content: "Updated Child" });

      // Root must change because its children array changed
      expect(newTree[0]).not.toBe(tree[0]);
      
      // Child 1 must be SAME
      expect(newTree[0].children![0]).toBe(tree[0].children![0]);

      // Child 2 must be NEW
      expect(newTree[0].children![1]).not.toBe(tree[0].children![1]);
      expect(newTree[0].children![1].content).toBe("Updated Child");
  });
});
