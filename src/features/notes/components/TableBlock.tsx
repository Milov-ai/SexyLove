import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
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
const TableCell = memo(
  ({
    value,
    rowIndex,
    colIndex,
    onChange,
    onFocus,
    isSelected,
  }: {
    value: string;
    rowIndex: number;
    colIndex: number;
    onChange: (rowIndex: number, colIndex: number, value: string) => void;
    onFocus: (rowIndex: number, colIndex: number) => void;
    isSelected: boolean;
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
      onChange(rowIndex, colIndex, e.target.value);
    };

    const handleFocus = () => {
      onFocus(rowIndex, colIndex);
    };

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        className={`w-full bg-transparent border-none focus:ring-0 px-3 py-2 text-slate-300 text-sm resize-none overflow-hidden leading-normal transition-colors ${
          isSelected ? "bg-violet-500/10" : ""
        }`}
        rows={1}
        style={{ height: "auto", minHeight: "44px" }}
      />
    );
  },
  (prev, next) => {
    return (
      prev.value === next.value &&
      prev.isSelected === next.isSelected &&
      prev.rowIndex === next.rowIndex &&
      prev.colIndex === next.colIndex
      // handlers are stable
    );
  },
);

// Sortable Row Component
const SortableRow = memo(
  ({
    row,
    rowIndex,
    onCellChange,
    onCellFocus,
    selectedColIndex,
  }: {
    row: Row;
    rowIndex: number;
    onCellChange: (rowIndex: number, colIndex: number, value: string) => void;
    onCellFocus: (rowIndex: number, colIndex: number) => void;
    selectedColIndex: number | null;
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
      willChange: "transform", // GPU Acceleration
    };

    return (
      <tr
        ref={setNodeRef}
        style={style as React.CSSProperties}
        className="border-b border-slate-800 last:border-0 group/row"
      >
        {/* Row Drag Handle */}
        <td className="w-10 p-0 border-r border-slate-800 bg-slate-900/50">
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
            className={`border-r border-slate-800 last:border-0 p-0 relative min-w-[140px] ${
              selectedColIndex === colIndex ? "bg-slate-900/30" : ""
            }`}
          >
            <TableCell
              value={cell.value}
              rowIndex={rowIndex}
              colIndex={colIndex}
              onChange={onCellChange}
              onFocus={onCellFocus}
              isSelected={false} // Can be used for cell-specific highlighting if needed
            />
          </td>
        ))}
      </tr>
    );
  },
);

// Sortable Column Handle Component
const SortableColHandle = memo(
  ({ colId, isSelected }: { colId: string; isSelected: boolean }) => {
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
      willChange: "transform", // GPU Acceleration
    };

    return (
      <div
        ref={setNodeRef}
        style={style as React.CSSProperties}
        className={`flex-1 min-w-[140px] flex flex-col items-center justify-center p-1 border-r border-slate-800 last:border-0 transition-colors ${
          isSelected
            ? "bg-violet-500/20 border-b-2 border-b-violet-500"
            : "bg-slate-900/50"
        }`}
      >
        <div
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing rounded p-1 transition-colors ${
            isSelected
              ? "text-violet-300"
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          }`}
        >
          <GripHorizontal size={14} />
        </div>
      </div>
    );
  },
);

export const TableBlock = memo(({ content, onChange }: TableBlockProps) => {
  // State to hold the structured data with IDs
  const [rows, setRows] = useState<Row[]>([]);
  const [colIds, setColIds] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Initialize state from content
  useEffect(() => {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
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
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
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

  const handleCellChange = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      setRows((prev) => {
        // Structural sharing optimization
        const newRows = [...prev];
        const newRow = { ...newRows[rowIndex] };
        const newCells = [...newRow.cells];
        newCells[colIndex] = { ...newCells[colIndex], value };
        newRow.cells = newCells;
        newRows[rowIndex] = newRow;
        return newRows;
      });
    },
    [],
  );

  const handleCellFocus = useCallback((rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: uuidv4(),
        cells: colIds.map(() => ({ id: uuidv4(), value: "" })),
      },
    ]);
  }, [colIds]);

  const addCol = useCallback(() => {
    setColIds((prev) => [...prev, uuidv4()]);
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        cells: [...row.cells, { id: uuidv4(), value: "" }],
      })),
    );
  }, []);

  const deleteRow = useCallback(() => {
    if (selectedCell && rows.length > 1) {
      setRows((prev) => prev.filter((_, i) => i !== selectedCell.row));
      setSelectedCell(null);
    }
  }, [selectedCell, rows.length]);

  const deleteCol = useCallback(() => {
    if (selectedCell && colIds.length > 1) {
      setColIds((prev) => prev.filter((_, i) => i !== selectedCell.col));
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          cells: row.cells.filter((_, i) => i !== selectedCell.col),
        })),
      );
      setSelectedCell(null);
    }
  }, [selectedCell, colIds.length]);

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30 shadow-sm">
        {/* Scrollable Container */}
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide">
          <div className="min-w-max">
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
                <div className="flex border-b border-slate-800/50 bg-slate-900/30">
                  <div className="w-10 shrink-0 border-r border-slate-800/50" />{" "}
                  {/* Spacer for row handles */}
                  {colIds.map((id, index) => (
                    <SortableColHandle
                      key={id}
                      colId={id}
                      isSelected={selectedCell?.col === index}
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
                <table className="border-collapse">
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <SortableRow
                        key={row.id}
                        row={row}
                        rowIndex={rowIndex}
                        onCellChange={handleCellChange}
                        onCellFocus={handleCellFocus}
                        selectedColIndex={selectedCell?.col ?? null}
                      />
                    ))}
                  </tbody>
                </table>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 px-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={addRow}
          className="h-9 px-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-all active:scale-95"
        >
          <Plus size={16} className="mr-2 text-violet-400" />
          <span className="text-xs font-medium">Fila</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={addCol}
          className="h-9 px-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-all active:scale-95"
        >
          <Plus size={16} className="mr-2 text-pink-400" />
          <span className="text-xs font-medium">Columna</span>
        </Button>

        {selectedCell && (
          <>
            <div className="w-px h-6 bg-slate-800 mx-1" />
            <Button
              variant="secondary"
              size="sm"
              onClick={deleteRow}
              className="h-9 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all active:scale-95"
            >
              <Trash2 size={16} className="mr-2" />
              <span className="text-xs font-medium">Fila</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={deleteCol}
              className="h-9 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all active:scale-95"
            >
              <Trash2 size={16} className="mr-2" />
              <span className="text-xs font-medium">Columna</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
});
