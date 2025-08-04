// Exported default config for use in other components
export const DEFAULT_CONFIG = {
  rows: 28,
  cols: 20,
  cellSize: 30,
  statusColors: {
    empty: "rgba(0, 128, 0, 0.6)",
    taken: "rgba(255, 165, 0, 0.6)",
    blocked: "rgba(255, 0, 0, 0.6)",
  },
};
// DynamicGrid.jsx
// This component renders a dynamic grid for managing reservations.

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";

const DynamicGrid = ({
  config = DEFAULT_CONFIG,
  reservations,
  onReservationsChange,
  selectedIndex,
  onSelectedIndexChange,
  static: isStatic = false, //možnost editovaní prostorů
  multiSelect = false, //možnost zvolit více rezervací
  clickableStatic = false, //možnost volit rezervace i ve ,,static,, = true
}) => {
  const {
    rows = DEFAULT_CONFIG.rows,
    cols = DEFAULT_CONFIG.cols,
    cellSize = DEFAULT_CONFIG.cellSize,
    statusColors = DEFAULT_CONFIG.statusColors,
  } = config;

  const statusLabels = {
    empty: "Aktivní",
    taken: "Rezervováno",
    blocked: "Blokováno",
  };

  const [startCell, setStartCell] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [resizingIndex, setResizingIndex] = useState(null);
  const gridRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const lastCoordsRef = useRef(null);

  // Selection is now fully controlled by parent
  // Selection is now fully controlled by parent
  const getSelectedIndices = () => {
    if (multiSelect) {
      return Array.isArray(selectedIndex) ? selectedIndex : [];
    } else {
      return selectedIndex !== null && selectedIndex !== undefined ? [selectedIndex] : [];
    }
  };
  const selectedIndices = getSelectedIndices();

  // Selection is now fully controlled by parent


  // Clamp function to ensure values stay within bounds
  // This function restricts a value to be within a specified range.
  const clamp = useCallback(
    (val, min, max) => Math.max(min, Math.min(max, val)),
    []
  );

  // Function to get cell coordinates based on mouse event
  // This function calculates the grid cell coordinates based on the mouse position.
  const getCellCoords = useCallback(
    (e) => {
      const rect = gridRef.current.getBoundingClientRect();
      const cellWidth = rect.width / cols;
      const cellHeight = rect.height / rows;

      const x = clamp(Math.floor((e.clientX - rect.left) / cellWidth), 0, cols - 1);
      const y = clamp(Math.floor((e.clientY - rect.top) / cellHeight), 0, rows - 1);

      return { x, y };
    },
    [clamp, rows, cols]
  );

  // Function to check if two rectangles overlap
  // This function determines if two rectangles defined by their coordinates overlap.
  const rectanglesOverlap = useCallback(
    (a, b) =>
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
    []
  );

  // Function to check if a new rectangle collides with existing reservations
  // This function checks if a new rectangle overlaps with any existing reservations,
  const hasCollision = useCallback(
    (newRect, ignoreIndex = -1) =>
      reservations.some(
        (r, i) => i !== ignoreIndex && rectanglesOverlap(newRect, r)
      ),
    [reservations, rectanglesOverlap]
  );

  // Function to handle mouse down events
  // This function initiates dragging or resizing of reservations based on mouse events.
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      lastCoordsRef.current = null;

      const coords = getCellCoords(e);
      let isReservationClicked = false;

      const resIndex = reservations.findIndex(
        (r) =>
          coords.x >= r.x &&
          coords.x < r.x + r.w &&
          coords.y >= r.y &&
          coords.y < r.y + r.h
      );

      if (resIndex !== -1) {
        const res = reservations[resIndex];
        isReservationClicked = true;

        if (!isStatic || res.status === "empty") {
          if (multiSelect) {
            let newSelected;
            if (selectedIndices.includes(resIndex)) {
              newSelected = selectedIndices.filter(i => i !== resIndex);
            } else {
              newSelected = [...selectedIndices, resIndex];
            }
            // setSelectedIndices removed; selection is now controlled by parent
            onSelectedIndexChange(newSelected);
          } else {
            // setSelectedIndices removed; selection is now controlled by parent
            onSelectedIndexChange(resIndex);
          }
        }

        if (!isStatic) {
          dragOffsetRef.current = {
            x: coords.x - res.x,
            y: coords.y - res.y,
          };

          if (e.target.classList.contains("resize-handle")) {
            setResizingIndex(resIndex);
            setDraggedIndex(null);
          } else {
            setDraggedIndex(resIndex);
            setResizingIndex(null);
          }
        }
      } else if (!isStatic) {
        setStartCell(coords);
        setIsDragging(true);
        setDraggedIndex(null);
        setResizingIndex(null);
      }

      // Deselect if clicking outside any reservation
      if (!isReservationClicked) {
        onSelectedIndexChange(null);
      }
    },
    [
      getCellCoords,
      reservations,
      isStatic,
      multiSelect,
      selectedIndices,
      onSelectedIndexChange,
      // setSelectedIndices removed; selection is now controlled by parent
      dragOffsetRef,
      setDraggedIndex,
      setResizingIndex,
      setStartCell,
      setIsDragging,
    ]
  );

  // Function to handle mouse move events
  // This function updates the hover cell and handles dragging/resizing.
  const handleMouseMove = useCallback(
    (e) => {
      if (isStatic) return;
      const coords = getCellCoords(e);

      if (isDragging && startCell) {
        setHoverCell(coords);
      }

      if (draggedIndex !== null) {
        const res = reservations[draggedIndex];
        const offset = dragOffsetRef.current;
        const newX = clamp(coords.x - offset.x, 0, cols - res.w);
        const newY = clamp(coords.y - offset.y, 0, rows - res.h);

        if (
          !hasCollision(
            { ...res, x: newX, y: newY },
            draggedIndex
          )
        ) {
          onReservationsChange((prev) =>
            prev.map((r, i) =>
              i === draggedIndex ? { ...r, x: newX, y: newY } : r
            )
          );
        }
      }

      if (resizingIndex !== null) {
        const res = reservations[resizingIndex];
        const minW = 1;
        const minH = 1;
        const newW = clamp(coords.x - res.x + 1, minW, cols - res.x);
        const newH = clamp(coords.y - res.y + 1, minH, rows - res.y);

        if (
          !hasCollision(
            { ...res, w: newW, h: newH },
            resizingIndex
          )
        ) {
          onReservationsChange((prev) =>
            prev.map((r, i) =>
              i === resizingIndex ? { ...r, w: newW, h: newH } : r
            )
          );
        }
      }
    },
    [
      isStatic,
      isDragging,
      startCell,
      getCellCoords,
      setHoverCell,
      draggedIndex,
      reservations,
      dragOffsetRef,
      clamp,
      cols,
      rows,
      hasCollision,
      onReservationsChange,
      resizingIndex,
      setResizingIndex,
    ]
  );

  // Function to handle mouse up events
  // This function finalizes the creation of a new reservation or ends dragging/resizing.
  const handleMouseUp = useCallback(
    (e) => {
      if (isStatic) return;

      if (isDragging && startCell && hoverCell) {
        const minX = Math.min(startCell.x, hoverCell.x);
        const minY = Math.min(startCell.y, hoverCell.y);
        const w = Math.abs(startCell.x - hoverCell.x) + 1;
        const h = Math.abs(startCell.y - hoverCell.y) + 1;

        const newRect = {
          x: minX,
          y: minY,
          w,
          h,
          name: `Cell ${reservations.length + 1}`,
          status: "empty",
        };

        if (
          !hasCollision(newRect) &&
          minX >= 0 &&
          minY >= 0 &&
          minX + w <= cols &&
          minY + h <= rows
        ) {
          onReservationsChange((prev) => [...prev, newRect]);
        }
      }

      setStartCell(null);
      setHoverCell(null);
      setIsDragging(false);
      setDraggedIndex(null);
      setResizingIndex(null);
      lastCoordsRef.current = null;
    },
    [
      isDragging,
      startCell,
      hoverCell,
      reservations,
      hasCollision,
      onReservationsChange,
      rows,
      cols,
      isStatic,
    ]
  );

  // Function to handle reservation deletion
  // This function removes a reservation from the grid based on its index.
  const handleDeleteReservation = useCallback(
    (index) => {
      if (isStatic) return; // Disable for static
      onReservationsChange((prev) => prev.filter((_, i) => i !== index));

      // Aktualizuj vybraný stav
      if (multiSelect) {
        const newSelected = selectedIndices.filter(i => i !== index);
        // setSelectedIndices removed; selection is now controlled by parent
        onSelectedIndexChange(newSelected);
      } else {
        if (selectedIndex === index) {
          onSelectedIndexChange(null);
        } else if (selectedIndex > index) {
          onSelectedIndexChange(selectedIndex - 1);
        }
      }
    },
    [onReservationsChange, onSelectedIndexChange, selectedIndex, selectedIndices, multiSelect, isStatic]
  );


  // Function to handle status change of a reservation
  // This function updates the status of a reservation based on user selection.
  const handleStatusChange = useCallback(
    (index, newStatus) => {
      if (isStatic) return; // Disable for static
      onReservationsChange((prev) =>
        prev.map((res, i) =>
          i === index ? { ...res, status: newStatus } : res
        )
      );
    },
    [onReservationsChange, isStatic]
  );

  // Generate grid cells based on rows and columns
  // This function creates a grid of cells based on the specified number of rows and columns.
  const gridCells = useMemo(
    () =>
      [...Array(rows * cols)].map((_, index) => {
        const x = index % cols;
        const y = Math.floor(index / cols);
        return (
          <div
            key={`${x}-${y}`}
            className="cell border"
            style={{
              gridColumn: x + 1,
              gridRow: y + 1,
              backgroundColor: "transparent",
              border: "1px solid #ccc",
              opacity: 0.3,
              boxSizing: "border-box",
              pointerEvents: "none",
              width: "100%",
              height: "100%",
            }}
          />
        );
      }),
    [rows, cols, cellSize]
  );


  // Filter out-of-bounds reservations and keep mapping to original indices
  const filteredReservationsWithIndex = reservations
    .map((res, idx) => ({ ...res, _originalIndex: idx }))
    .filter(
      (res) =>
        res.x >= 0 && res.y >= 0 &&
        res.x + res.w <= cols &&
        res.y + res.h <= rows
    );

  return (
    <div
      ref={gridRef}
      className="position-relative h-100 rounded grid-bg"
      onMouseDown={handleMouseDown}
      onMouseMove={isStatic ? undefined : handleMouseMove}
      onMouseUp={isStatic ? undefined : handleMouseUp}
      onMouseLeave={isStatic ? undefined : handleMouseUp}
      onContextMenu={(e) => (isStatic ? undefined : e.preventDefault())}
      style={{
        width: "100%",
        height: "auto", 
        aspectRatio: `${cols} / ${rows}`,
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        cursor: isStatic ? "default" : "crosshair",
        position: "relative",
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      {/* Grid buňky (pozadí) */}
      {gridCells.map((cell, i) => React.cloneElement(cell, { key: i }))}

      {/* Rezervace */}
      {filteredReservationsWithIndex.map((res, i) => {
        const origIdx = res._originalIndex;
        return (
          <div
            key={origIdx}
            data-index={origIdx}
            className={`reservation ${res.status} ${draggedIndex === origIdx ? "dragging" : ""}`}
            onContextMenu={(e) => {
              if (!isStatic) {
                e.preventDefault();
                handleDeleteReservation(origIdx);
              }
            }}
            style={{
              position: "absolute",
              left: (res.x / cols) * 100 + "%",
              top: (res.y / rows) * 100 + "%",
              width: (res.w / cols) * 100 + "%",
              height: (res.h / rows) * 100 + "%",
              backgroundColor: statusColors[res.status],
              border: selectedIndices.includes(origIdx) ? "2px solid black" : "none",
              boxShadow: selectedIndices.includes(origIdx) ? "0 0 8px 2px rgba(0,0,0,0.3)" : "none",
              borderRadius: 4,
              fontSize: "0.8rem",
              textAlign: "center",
              transition: draggedIndex === origIdx || resizingIndex === origIdx ? "none" : "all 0.2s ease",
              zIndex: 2,
              cursor: isStatic ? (res.status === "empty" ? "pointer" : "default") : "move",
              overflow: "hidden",
              userSelect: "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isStatic || (clickableStatic && res.status === "empty")) {
                // Always notify parent of clicked index; parent manages selection array
                onSelectedIndexChange(origIdx);
              }
            }}
          >
            <div className="d-flex flex-column h-100 p-1">
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <strong>{i + 1}</strong>
              </div>
              {isStatic ? (
                <div className="status-text text-center">
                  {statusLabels[res.status]}
                </div>
              ) : (
                <select
                  className="form-select form-select-sm"
                  value={res.status}
                  onChange={(e) => handleStatusChange(origIdx, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="empty">Volné</option>
                  <option value="taken">Rezervováno</option>
                  <option value="blocked">Blokováno</option>
                </select>
              )}
            </div>
            {!isStatic && (
              <div
                className="resize-handle"
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: "1rem",
                  height: "1rem",
                  backgroundColor: "black",
                  cursor: "nwse-resize",
                  zIndex: 3,
                  border: "1px solid white",
                  borderRadius: "0 0 4px 0",
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>
        );
      })}

      {/* Výběr nové rezervace (draft) */}
      {!isStatic && isDragging && startCell && hoverCell && (
        <div
          className="reservation-draft"
          style={{
            position: "absolute",
            left: (Math.min(startCell.x, hoverCell.x) / cols) * 100 + "%",
            top: (Math.min(startCell.y, hoverCell.y) / rows) * 100 + "%",
            width: ((Math.abs(startCell.x - hoverCell.x) + 1) / cols) * 100 + "%",
            height: ((Math.abs(startCell.y - hoverCell.y) + 1) / rows) * 100 + "%",
            backgroundColor: "rgba(0, 128, 0, 0.3)",
            pointerEvents: "none",
            zIndex: 1,
            border: "2px dashed rgba(0, 128, 0, 0.7)",
            borderRadius: 4,
          }}
        />
      )}
    </div>
  );
};


export default DynamicGrid;
