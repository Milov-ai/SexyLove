import type { Block } from "@/store/notes.store";

type TreeUpdateResult = {
  tree: Block[];
  success: boolean;
};

// Find a block and its parent/index in the tree
export const findBlockPath = (
  tree: Block[],
  id: string,
  path: number[] = [],
): {
  node: Block;
  parent: Block | null;
  index: number;
  path: number[];
} | null => {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      return { node: tree[i], parent: null, index: i, path: [...path, i] };
    }
    if (tree[i].children && tree[i].children!.length > 0) {
      const result = findBlockPath(tree[i].children!, id, [...path, i]);
      if (result) {
        // Only set parent if not already assigned (direct parent discovery)
        if (result.parent === null) {
          return { ...result, parent: tree[i] };
        }
        return result; // Parent already set, pass unchanged
      }
    }
  }
  return null;
};

// Helper: structuredClone or JSON deep copy
const cloneTree = (tree: Block[]) =>
  JSON.parse(JSON.stringify(tree)) as Block[];

export const indentBlock = (tree: Block[], id: string): TreeUpdateResult => {
  const newTree = cloneTree(tree);
  const found = findBlockPath(newTree, id);

  if (!found) return { tree, success: false };
  const { node, parent, index } = found;

  // Cannot indent if it's the first child
  if (index === 0) return { tree, success: false };

  // Identify new parent (previous sibling)
  const currentLevel = parent ? parent.children! : newTree;
  const prevSibling = currentLevel[index - 1];

  // Remove from current position
  currentLevel.splice(index, 1);

  // Add to prevSibling's children
  if (!prevSibling.children) prevSibling.children = [];
  prevSibling.children.push(node);

  return { tree: newTree, success: true };
};

export const outdentBlock = (tree: Block[], id: string): TreeUpdateResult => {
  const newTree = cloneTree(tree);
  const found = findBlockPath(newTree, id);

  if (!found) return { tree, success: false };
  const { node, parent } = found;

  // Cannot outdent if no parent (already at root)
  if (!parent) return { tree, success: false };

  // Find parent's parent (grandparent)
  // We need to re-scan to find the parent's location
  const parentFound = findBlockPath(newTree, parent.id);
  if (!parentFound) return { tree, success: false }; // Should not happen

  const { parent: grandParent, index: parentIndex } = parentFound;
  const targetLevel = grandParent ? grandParent.children! : newTree;

  // Remove form current parent
  parent.children!.splice(found.index, 1);

  // Insert after parent in the upper level
  targetLevel.splice(parentIndex + 1, 0, node);

  return { tree: newTree, success: true };
};

export const deleteBlockFromTree = (tree: Block[], id: string): Block[] => {
  const newTree = cloneTree(tree);
  const found = findBlockPath(newTree, id);
  if (!found) return newTree;

  const { parent, index } = found;
  const list = parent ? parent.children! : newTree;
  list.splice(index, 1);

  return newTree;
};

export const updateBlockInTree = (
  tree: Block[],
  id: string,
  updates: Partial<Block>,
): Block[] => {
  const pathInfo = findBlockPath(tree, id);
  if (!pathInfo) return tree;

  const { path } = pathInfo;
  
  // Shallow clone root
  const newTree = [...tree];
  let currentLevel = newTree;
  let currentOriginalLevel = tree;

  for (let i = 0; i < path.length; i++) {
    const index = path[i];
    const originalNode = currentOriginalLevel[index];
    
    // Shallow clone the node at path
    const newNode = { ...originalNode };

    if (i === path.length - 1) {
      // Target node: Apply updates
      Object.assign(newNode, updates);
    } else {
      // Intermediate node: Clone children array for next step
      newNode.children = [...(originalNode.children || [])];
    }

    // Update the pointer in the cloned array
    currentLevel[index] = newNode;

    // Descend
    if (i < path.length - 1) {
      currentLevel = newNode.children!;
      currentOriginalLevel = originalNode.children!;
    }
  }

  return newTree;
};

export const addSibling = (
  tree: Block[],
  referenceId: string,
  newBlock: Block,
): TreeUpdateResult => {
  const newTree = JSON.parse(JSON.stringify(tree)) as Block[]; // Use simple clone for now
  const found = findBlockPath(newTree, referenceId);

  if (!found) return { tree, success: false };
  const { parent, index } = found;

  const currentLevel = parent ? parent.children! : newTree;

  // Insert after the referencing block
  currentLevel.splice(index + 1, 0, newBlock);

  return { tree: newTree, success: true };
};

// Move a block from one position to another (potentially different parent)
export const moveBlockInTree = (
  tree: Block[],
  activeId: string,
  overId: string,
): Block[] => {
  const newTree = cloneTree(tree);

  const source = findBlockPath(newTree, activeId);
  const target = findBlockPath(newTree, overId);

  if (!source || !target) return tree;

  // If moving to same location, return early
  if (source.node.id === target.node.id) return tree;

  // Cycle Detection: Check if 'target' is inside 'source' (moving parent into child)
  // We can check if 'target' path includes 'source' index/id?
  // Simpler: Traverse 'source.node' to see if 'overId' exists in it.
  const isTargetDescendant = !!findBlockPath([source.node], overId);
  if (isTargetDescendant) {
    // Prevent cycle
    return tree;
  }

  const { parent: sourceParent, index: sourceIndex } = source;
  const { parent: targetParent, index: targetIndex } = target;

  const sourceList = sourceParent ? sourceParent.children! : newTree;
  const targetList = targetParent ? targetParent.children! : newTree;

  // Remove from source
  const [movedNode] = sourceList.splice(sourceIndex, 1);

  // Calculate new index
  // If we are in the same list and moving down, the index needs adjustment because of removal
  const adjustedTargetIndex =
    targetIndex < sourceIndex ? targetIndex + 1 : targetIndex;

  if (sourceList === targetList) {
    // Same list reordering handled by simple insertion at target index
    // But if we use this generic move for everything, we need to be careful.
    // dnd-kit's arrayMove handles this automatically for flat lists.
    // For general tree move, splice logic is:
    // If we remove from 2 and want to insert at 5, the new index 5 corresponds to old index 5.
    // BUT after removal, everything shifts.
    // It's safer to rely on dnd-kit's arrayMove logic for same-parent moves
    // But here we want a GENERIC tree move.
    // Let's stick to simple splice insertion.
    // NOTE: dnd-kit provides 'over' as the item we are OVER.
    // Standard Sortable logic: if dragging DOWN, insert AFTER. If UP, insert BEFORE.
    // Since we don't know direction easily here without extra logic:
    // We will assume "Place at the position of the Target".
  }

  // Insert at target
  targetList.splice(adjustedTargetIndex, 0, movedNode);

  return newTree;
};

export const getBlockChain = (tree: Block[], id: string): Block[] | null => {
  for (const block of tree) {
    if (block.id === id) {
      return [block];
    }
    if (block.children) {
      const path = getBlockChain(block.children, id);
      if (path) {
        return [block, ...path];
      }
    }
  }
  return null;
};
