// DynamicGrid.jsx
// This component renders a dynamic grid for managing reservations.

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";

// Default configuration for the grid
// This configuration defines the number of rows, columns, cell size, and status colors.
export const DEFAULT_CONFIG = {
  rows: 28,
  cols: 20,
  cellSize: 30,
  statusColors: {
    active: "rgba(0, 128, 0, 0.6)",
    reserved: "rgba(255, 165, 0, 0.6)",
    blocked: "rgba(255, 0, 0, 0.6)",
  },
};

/** * DynamicGrid component
 * This component renders a grid where users can create, move, resize,
 * and delete reservations.
 */
const DynamicGrid = ({
  config = DEFAULT_CONFIG,
  reservations,
  onReservationsChange,
  selectedIndex,
  onSelectedIndexChange,
  static: isStatic = false,
}) => {
  const {
    rows = DEFAULT_CONFIG.rows,
    cols = DEFAULT_CONFIG.cols,
    cellSize = DEFAULT_CONFIG.cellSize,
    statusColors = DEFAULT_CONFIG.statusColors,
  } = config;

  const statusLabels = {
    active: "Aktivní",
    reserved: "Rezervováno",
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
      const x = clamp(
        Math.floor((e.clientX - rect.left) / cellSize),
        0,
        cols - 1
      );
      const y = clamp(
        Math.floor((e.clientY - rect.top) / cellSize),
        0,
        rows - 1
      );
      return { x, y };
    },
    [clamp, cellSize, rows, cols]
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

        if (!isStatic || res.status === "active") {
          onSelectedIndexChange(resIndex);
        }

        if (!isStatic) {
          dragOffsetRef.current = {
            x: coords.x - res.x,
            y: coords.y - res.y,
          };

          // FIX: Only set draggedIndex OR resizingIndex, not both
          if (e.target.classList.contains("resize-handle")) {
            setResizingIndex(resIndex);
            setDraggedIndex(null); // Ensure dragging is not activated
          } else {
            setDraggedIndex(resIndex);
            setResizingIndex(null); // Ensure resizing is not activated
          }
        }
      } else if (!isStatic) {
        setStartCell(coords);
        setIsDragging(true);
        setDraggedIndex(null); // FIX: Clear drag index when starting new selection
        setResizingIndex(null); // FIX: Clear resize index when starting new selection
      }

      // ... deselection logic ...
    },
    [getCellCoords, reservations, onSelectedIndexChange, isStatic]
  );

  // Function to handle mouse move events
  // This function updates the grid based on mouse movements, allowing for dragging and resizing of reservations
  const handleMouseMove = useCallback(
    (e) => {
      if (isStatic) return; // Disable for static
      const coords = getCellCoords(e);

      if (
        lastCoordsRef.current &&
        lastCoordsRef.current.x === coords.x &&
        lastCoordsRef.current.y === coords.y
      ) {
        return;
      }
      lastCoordsRef.current = coords;

      if (isDragging) {
        setHoverCell(coords);
      } else if (draggedIndex !== null) {
        onReservationsChange((prev) => {
          const updated = [...prev];
          const res = updated[draggedIndex];
          const newX = coords.x - dragOffsetRef.current.x;
          const newY = coords.y - dragOffsetRef.current.y;
          const nextRect = {
            ...res,
            x: clamp(newX, 0, cols - res.w),
            y: clamp(newY, 0, rows - res.h),
          };

          if (!hasCollision(nextRect, draggedIndex)) {
            updated[draggedIndex] = nextRect;
          }
          return updated;
        });
      } else if (resizingIndex !== null) {
        onReservationsChange((prev) => {
          const updated = [...prev];
          const res = updated[resizingIndex];
          const newW = Math.max(1, coords.x - res.x + 1);
          const newH = Math.max(1, coords.y - res.y + 1);
          const nextRect = {
            ...res,
            w: clamp(newW, 1, cols - res.x),
            h: clamp(newH, 1, rows - res.y),
          };

          if (!hasCollision(nextRect, resizingIndex)) {
            updated[resizingIndex] = nextRect;
          }
          return updated;
        });
      }
    },
    [
      getCellCoords,
      isDragging,
      draggedIndex,
      resizingIndex,
      clamp,
      hasCollision,
      onReservationsChange,
      rows,
      cols,
      isStatic,
    ]
  );

  // Function to handle mouse up events
  // This function finalizes the reservation creation or updates based on mouse release.
  const handleMouseUp = useCallback(() => {
    if (isStatic) return; // Disable for static
    if (isDragging && startCell && hoverCell) {
      const minX = Math.min(startCell.x, hoverCell.x);
      const minY = Math.min(startCell.y, hoverCell.y);
      const maxX = Math.max(startCell.x, hoverCell.x);
      const maxY = Math.max(startCell.y, hoverCell.y);

      const w = maxX - minX + 1;
      const h = maxY - minY + 1;

      const newRect = {
        x: minX,
        y: minY,
        w,
        h,
        name: `Cell ${reservations.length + 1}`,
        status: "active",
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
  }, [
    isDragging,
    startCell,
    hoverCell,
    reservations,
    hasCollision,
    onReservationsChange,
    rows,
    cols,
    isStatic,
  ]);

  // Function to handle reservation deletion
  // This function removes a reservation from the grid based on its index.
  const handleDeleteReservation = useCallback(
    (index) => {
      if (isStatic) return; // Disable for static
      onReservationsChange((prev) => prev.filter((_, i) => i !== index));
      if (selectedIndex === index) {
        onSelectedIndexChange(null);
      } else if (selectedIndex > index) {
        onSelectedIndexChange(selectedIndex - 1);
      }
    },
    [onReservationsChange, onSelectedIndexChange, selectedIndex, isStatic]
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
              width: cellSize,
              height: cellSize,
              border: "1px solid #eee",
              gridColumn: x + 1,
              gridRow: y + 1,
              opacity: 0.4,
            }}
          />
        );
      }),
    [rows, cols, cellSize]
  );

  return (
    <div
      ref={gridRef}
      className="position-relative rounded grid-bg"
      onMouseDown={handleMouseDown}
      onMouseMove={isStatic ? undefined : handleMouseMove}
      onMouseUp={isStatic ? undefined : handleMouseUp}
      onMouseLeave={isStatic ? undefined : handleMouseUp}
      onContextMenu={(e) => (isStatic ? undefined : e.preventDefault())}
      style={{
        width: cols * cellSize,
        height: rows * cellSize,
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        cursor: isStatic ? "default" : "crosshair", // Changed to default
      }}
    >
      {gridCells}

{reservations.map((res, i) => (
        <div
          key={i}
          data-index={i}
          className={`reservation ${res.status} ${
            draggedIndex === i ? "dragging" : ""
          }`}
          onContextMenu={(e) => {
            if (!isStatic) {
              e.preventDefault();
              handleDeleteReservation(i);
            }
          }}
          style={{
            position: "absolute",
            left: res.x * cellSize,
            top: res.y * cellSize,
            width: res.w * cellSize,
            height: res.h * cellSize,
            backgroundColor: statusColors[res.status],
            border: i === selectedIndex ? "2px solid black" : "none",
            fontSize: 12,
            textAlign: "center",
            transition:
              draggedIndex === i || resizingIndex === i
                ? "none"
                : "all 0.2s ease",
            zIndex: 2,
            // Only show pointer for active reservations in static mode
            cursor: isStatic
              ? res.status === "active" ? "pointer" : "default"
              : "move",
          }}
        >
          <div className="d-flex flex-column h-100 p-1">
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
              <strong>{i + 1}</strong>
            </div>
            {isStatic ? (
              // Show status text in static mode
              <div className="status-text text-center">
                {statusLabels[res.status]}
              </div>
            ) : (
              // Show dropdown in non-static mode
              <select
                className="form-select form-select-sm"
                value={res.status}
                onChange={(e) => handleStatusChange(i, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="active">Aktivní</option>
                <option value="reserved">Rezervováno</option>
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
                width: 12, // FIX: Increased size for better usability
                height: 12,
                backgroundColor: "black",
                cursor: "nwse-resize",
                zIndex: 3,
                border: "1px solid white", // FIX: Better visibility
              }}
            />
          )}
        </div>
      ))}

      {!isStatic && isDragging && startCell && hoverCell && (
        <div
          className="reservation-draft"
          style={{
            position: "absolute",
            left: Math.min(startCell.x, hoverCell.x) * cellSize,
            top: Math.min(startCell.y, hoverCell.y) * cellSize,
            width: (Math.abs(startCell.x - hoverCell.x) + 1) * cellSize,
            height: (Math.abs(startCell.y - hoverCell.y) + 1) * cellSize,
            backgroundColor: "rgba(0, 128, 0, 0.3)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
};

export default DynamicGrid;
