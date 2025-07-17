// DynamicGrid.js
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle
} from "react";

const DEFAULT_CONFIG = {
  rows: 56, // Násobit
  cols: 40, // Násobit
  cellSize: 15, // Dělit
  statusColors: {
    active: "rgba(0, 128, 0, 0.6)",
    reserved: "rgba(255, 165, 0, 0.6)",
    blocked: "rgba(255, 0, 0, 0.6)",
  },
};

const DynamicGrid = forwardRef((
  {
    config = DEFAULT_CONFIG,
    reservations,
    onReservationsChange,
    selectedIndex,
    onSelectedIndexChange
  },
  ref
) => {
  // Destructure config with defaults
  const {
    rows = DEFAULT_CONFIG.rows,
    cols = DEFAULT_CONFIG.cols,
    cellSize = DEFAULT_CONFIG.cellSize,
    statusColors = DEFAULT_CONFIG.statusColors,
  } = config;

  // Generate unique storage key based on grid dimensions
  const STORAGE_KEY = useMemo(
    () => `reservationData_${rows}x${cols}`,
    [rows, cols]
  );

  const [startCell, setStartCell] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [resizingIndex, setResizingIndex] = useState(null);
  const gridRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const lastCoordsRef = useRef(null);

  // Save to localStorage whenever reservations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  }, [reservations, STORAGE_KEY]);

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    getInternalReservations: () => reservations,
    clearAllReservations: () => {
      onReservationsChange([]);
      onSelectedIndexChange(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }));

  // Clamp a value to the valid grid range
  const clamp = useCallback(
    (val, min, max) => Math.max(min, Math.min(max, val)),
    []
  );

  // Convert mouse coordinates to grid cell coordinates (clamped)
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

  // Check if two rectangles overlap
  const rectanglesOverlap = useCallback(
    (a, b) =>
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
    []
  );

  // Check for collisions with other reservations
  const hasCollision = useCallback(
    (newRect, ignoreIndex = -1) =>
      reservations.some(
        (r, i) => i !== ignoreIndex && rectanglesOverlap(newRect, r)
      ),
    [reservations, rectanglesOverlap]
  );

  // Mouse down handler
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      lastCoordsRef.current = null;

      const coords = getCellCoords(e);

      // Check for resize handle click
      if (e.target.classList.contains("resize-handle")) {
        const index = parseInt(
          e.target.closest(".reservation").dataset.index,
          10
        );
        setResizingIndex(index);
        onSelectedIndexChange(index);
        return;
      }

      // Check for reservation click
      const resIndex = reservations.findIndex(
        (r) =>
          coords.x >= r.x &&
          coords.x < r.x + r.w &&
          coords.y >= r.y &&
          coords.y < r.y + r.h
      );

      if (resIndex !== -1) {
        const res = reservations[resIndex];
        dragOffsetRef.current = {
          x: coords.x - res.x,
          y: coords.y - res.y,
        };
        setDraggedIndex(resIndex);
        onSelectedIndexChange(resIndex);
      } else {
        setStartCell(coords);
        setIsDragging(true);
        onSelectedIndexChange(null);
      }
    },
    [getCellCoords, reservations, onSelectedIndexChange]
  );

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e) => {
      const coords = getCellCoords(e);

      // Skip if coordinates haven't changed
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
    ]
  );

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
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
        const newIndex = reservations.length;
        onReservationsChange((prev) => [...prev, newRect]);
        onSelectedIndexChange(newIndex);
      }
    }

    // Reset all drag states
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
    onSelectedIndexChange,
    rows,
    cols,
  ]);

  // Delete reservation
  const handleDeleteReservation = useCallback(
    (index) => {
      onReservationsChange((prev) => prev.filter((_, i) => i !== index));
      if (selectedIndex === index) {
        onSelectedIndexChange(null);
      } else if (selectedIndex > index) {
        onSelectedIndexChange(selectedIndex - 1);
      }
    },
    [onReservationsChange, onSelectedIndexChange, selectedIndex]
  );

  // Change reservation status
  const handleStatusChange = useCallback(
    (index, newStatus) => {
      onReservationsChange((prev) =>
        prev.map((res, i) =>
          i === index ? { ...res, status: newStatus } : res
        )
      );
    },
    [onReservationsChange]
  );

  // Generate grid cells (memoized for performance)
  const gridCells = useMemo(
    () =>
      [...Array(rows * cols)].map((_, index) => {
        const x = index % cols;
        const y = Math.floor(index / cols);
        return (
          <div
            key={`${x}-${y}`}
            className="cell"
            style={{
              width: cellSize,
              height: cellSize,
              border: "1px solid #eee",
              gridColumn: x + 1,
              gridRow: y + 1,
            }}
          />
        );
      }),
    [rows, cols, cellSize]
  );

  return (
    <div
      ref={gridRef}
      className="position-relative border"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        width: cols * cellSize,
        height: rows * cellSize,
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      }}
    >
      {/* Grid cells */}
      {gridCells}

      {/* Reservation boxes */}
      {reservations.map((res, i) => (
        <div
          key={i}
          data-index={i}
          className={`reservation ${res.status} ${
            draggedIndex === i ? "dragging" : ""
          }`}
          onContextMenu={(e) => {
            e.preventDefault();
            handleDeleteReservation(i);
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
          }}
        >
          <div className="d-flex flex-column h-100 p-1">
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
              <strong>{i + 1}</strong>
            </div>
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
          </div>
          <div
            className="resize-handle"
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 10,
              height: 10,
              backgroundColor: "white",
              border: "1px solid black",
              cursor: "nwse-resize",
            }}
          />
        </div>
      ))}

      {/* Draft preview box */}
      {isDragging && startCell && hoverCell && (
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
});

export default DynamicGrid;