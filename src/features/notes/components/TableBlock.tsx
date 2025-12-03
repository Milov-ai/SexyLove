import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, GripHorizontal, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface TableBlockProps {
  content: string;
  onChange: (content: string) => void;
  isEditable?: boolean;
}

interface Cell {
  id: string;
  value: string;
}

interface Row {
  id: string;
  cells: Cell[];
}

// Table Cell Component with Auto-Resize
const TableCell = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
        onChange(e.target.value);
      }}
      className="w-full bg-transparent border-none focus:ring-0 px-3 py-2 text-slate-300 text-sm resize-none overflow-hidden leading-normal"
      rows={1}
      style={{ height: "auto", minHeight: "38px" }}
    />
  );
};

// Sortable Row Component
const SortableRow = ({
  row,
  rowIndex,
  onCellChange,
  onDeleteRow,
}: {
  row: Row;
  rowIndex: number;
  onCellChange: (rowIndex: number, colIndex: number, value: string) => void;
  onDeleteRow: (rowIndex: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
    position: isDragging ? "relative" : ("static" as const),
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-slate-800 last:border-0 group/row"
    >
      {/* Row Drag Handle */}
      <td className="w-8 p-0 border-r border-slate-800 bg-slate-900/50">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing hover:bg-slate-800 text-slate-500 hover:text-slate-300 py-2"
        >
          <GripVertical size={14} />
        </div>
      </td>

      {row.cells.map((cell, colIndex) => (
        <td
          key={cell.id}
          className="border-r border-slate-800 last:border-0 p-0 relative min-w-[100px]"
        >
          <TableCell
            value={cell.value}
            onChange={(val) => onCellChange(rowIndex, colIndex, val)}
          />
        </td>
      ))}

      {/* Delete Row Action */}
      <td className="w-8 p-0 border-l border-slate-800 bg-slate-900/50 opacity-0 group-hover/row:opacity-100 transition-opacity">
        <button
          onClick={() => onDeleteRow(rowIndex)}
          className="flex items-center justify-center w-full h-full hover:bg-red-500/20 text-slate-500 hover:text-red-400"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
};

// Sortable Column Handle Component
const SortableColHandle = ({
  colId,
  index,
  onDeleteCol,
}: {
  colId: string;
  index: number;
  onDeleteCol: (index: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: colId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-1 bg-slate-900/50 border-r border-slate-800 last:border-0 group/col"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing hover:bg-slate-800 rounded p-1 text-slate-500 hover:text-slate-300"
      >
        <GripHorizontal size={14} />
      </div>
      <button
        onClick={() => onDeleteCol(index)}
        className="mt-1 opacity-0 group-hover/col:opacity-100 p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );
};

export const TableBlock = ({ content, onChange }: TableBlockProps) => {
  // State to hold the structured data with IDs
  const [rows, setRows] = useState<Row[]>([]);
  const [colIds, setColIds] = useState<string[]>([]);

  // Initialize state from content
  useEffect(() => {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
        // If we already have rows in state and they match dimensions, try to preserve IDs?
        // For simplicity, we'll regenerate IDs if content changes externally,
        // but we rely on internal updates for stability.
        // To avoid loop, we only update if content is significantly different or if state is empty.

        // Actually, better to just initialize once or check if deep equal.
        // But since we control onChange, we can just initialize if empty.
        if (rows.length === 0) {
          const initialColIds = parsed[0].map(() => uuidv4());
          const initialRows = parsed.map((row: string[]) => ({
            id: uuidv4(),
            cells: row.map((cell) => ({ id: uuidv4(), value: cell })),
          }));
          setRows(initialRows);
          setColIds(initialColIds);
        }
      } else {
        // Default empty table
        const initialColIds = [uuidv4(), uuidv4()];
        setRows([
          {
            id: uuidv4(),
            cells: [
              { id: uuidv4(), value: "" },
              { id: uuidv4(), value: "" },
            ],
          },
          {
            id: uuidv4(),
            cells: [
              { id: uuidv4(), value: "" },
              { id: uuidv4(), value: "" },
            ],
          },
        ]);
        setColIds(initialColIds);
      }
    } catch {
      // Error fallback
      const initialColIds = [uuidv4(), uuidv4()];
      setRows([
        {
          id: uuidv4(),
          cells: [
            { id: uuidv4(), value: "" },
            { id: uuidv4(), value: "" },
          ],
        },
        {
          id: uuidv4(),
          cells: [
            { id: uuidv4(), value: "" },
            { id: uuidv4(), value: "" },
          ],
        },
      ]);
      setColIds(initialColIds);
    }
  }, [content, rows.length]); // Run once on mount. Updates will be handled by handlers.

  // Sync back to content string whenever rows change
  useEffect(() => {
    if (rows.length > 0) {
      const rawData = rows.map((r) => r.cells.map((c) => c.value));
      const stringified = JSON.stringify(rawData);
      if (stringified !== content) {
        onChange(stringified);
      }
    }
  }, [rows, onChange, content]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEndRows = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRows((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndCols = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = colIds.indexOf(active.id as string);
      const newIndex = colIds.indexOf(over.id as string);

      setColIds((ids) => arrayMove(ids, oldIndex, newIndex));
      setRows((currentRows) =>
        currentRows.map((row) => ({
          ...row,
          cells: arrayMove(row.cells, oldIndex, newIndex),
        })),
      );
    }
  };

  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    value: string,
  ) => {
    setRows((prev) => {
      const newRows = [...prev];
      newRows[rowIndex].cells[colIndex].value = value;
      return newRows;
    });
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: uuidv4(),
        cells: colIds.map(() => ({ id: uuidv4(), value: "" })),
      },
    ]);
  };

  const addCol = () => {
    setColIds((prev) => [...prev, uuidv4()]);
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        cells: [...row.cells, { id: uuidv4(), value: "" }],
      })),
    );
  };

  const deleteRow = (index: number) => {
    if (rows.length <= 1) return; // Prevent deleting last row
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteCol = (index: number) => {
    if (colIds.length <= 1) return; // Prevent deleting last col
    setColIds((prev) => prev.filter((_, i) => i !== index));
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        cells: row.cells.filter((_, i) => i !== index),
      })),
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full border border-slate-800 rounded-lg overflow-hidden bg-slate-950/30">
        {/* Column Drag Handles */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndCols}
        >
          <SortableContext
            items={colIds}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex border-b border-slate-800 pl-8 pr-8">
              {colIds.map((id, index) => (
                <SortableColHandle
                  key={id}
                  colId={id}
                  index={index}
                  onDeleteCol={deleteCol}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndRows}
        >
          <SortableContext
            items={rows.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="w-full text-sm text-left text-slate-300 border-collapse">
              <tbody>
                {rows.map((row, rowIndex) => (
                  <SortableRow
                    key={row.id}
                    row={row}
                    rowIndex={rowIndex}
                    onCellChange={handleCellChange}
                    onDeleteRow={deleteRow}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex gap-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={addRow}
          className="text-slate-500 hover:text-violet-400 h-6 text-xs"
        >
          <Plus size={12} className="mr-1" /> Fila
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addCol}
          className="text-slate-500 hover:text-violet-400 h-6 text-xs"
        >
          <Plus size={12} className="mr-1" /> Columna
        </Button>
      </div>
    </div>
  );
};
