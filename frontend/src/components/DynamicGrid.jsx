// DynamicGrid.js
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";

import {
  Container,
  Row,
  Col,
  Badge,
  Button,
  Stack,
  Form,
} from "react-bootstrap";

const DEFAULT_CONFIG = {
  rows: 14,
  cols: 10,
  cellSize: 60,
  statusColors: {
    active: "rgba(0, 128, 0, 0.6)",
    reserved: "rgba(255, 165, 0, 0.6)",
    blocked: "rgba(255, 0, 0, 0.6)",
  },
};

const DynamicGrid = ({
  config = DEFAULT_CONFIG,
  reservations,
  onReservationsChange,
  selectedIndex,
  onSelectedIndexChange,
}) => {
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

  // Clear all reservations and storage
  const handleClearAll = useCallback(() => {
    if (window.confirm("Opravdu chcete smazat všechny rezervace?")) {
      onReservationsChange([]);
      onSelectedIndexChange(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [onReservationsChange, onSelectedIndexChange, STORAGE_KEY]);

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

  const generateReservationJson = useCallback(() => {
    const reservationsJson = reservations.map((res) => {
      // Generate cell IDs using the formula: (y * cols + x) + 1
      const cells = [];
      for (let row = res.y; row < res.y + res.h; row++) {
        for (let col = res.x; col < res.x + res.w; col++) {
          // Cell ID: row * columns + column + 1 (1-indexed)
          const cellId = row * cols + col + 1;
          cells.push(cellId);
        }
      }

      return {
        user: 1, // Static user ID
        event: 2, // Static event ID
        reserved_from: "2025-08-01T10:00:00Z", // Static start time
        reserved_to: "2025-08-01T18:00:00Z", // Static end time
        status: res.status, // From reservation
        note: res.name, // Using reservation name as note
        cells: cells.sort((a, b) => a - b), // Sorted cell IDs
      };
    });

    // Create JSON string and log to console
    const dataStr = JSON.stringify(reservationsJson, null, 2);
    console.log(dataStr);

    // Also copy to clipboard for convenience
    navigator.clipboard.writeText(dataStr);
    alert("Reservation JSON copied to clipboard and logged to console");
  }, [reservations, cols]);

  // Function to convert JSON reservations to internal format
  const convertJsonToReservations = useCallback(
    (jsonData) => {
      return jsonData.map((res, index) => {
        // Find min and max coordinates from cell IDs
        const minCellId = Math.min(...res.cells);
        const maxCellId = Math.max(...res.cells);

        const minX = (minCellId - 1) % cols;
        const minY = Math.floor((minCellId - 1) / cols);
        const maxX = (maxCellId - 1) % cols;
        const maxY = Math.floor((maxCellId - 1) / cols);

        return {
          x: minX,
          y: minY,
          w: maxX - minX + 1,
          h: maxY - minY + 1,
          name: res.note || `Reservation ${index + 1}`,
          status: res.status || "active",
        };
      });
    },
    [cols]
  );

  // File upload handler
  const handleFileUpload = useCallback(
    (file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (Array.isArray(data)) {
            // Try to detect if it's the new JSON format
            if (data[0]?.cells) {
              const convertedReservations = convertJsonToReservations(data);
              onReservationsChange(convertedReservations);
              onSelectedIndexChange(null);
              alert(`Načteno ${convertedReservations.length} rezervací`);
            }
            // Support older format too
            else if (data[0]?.x !== undefined) {
              onReservationsChange(data);
              onSelectedIndexChange(null);
              alert(`Načteno ${data.length} rezervací`);
            } else {
              alert("Neplatný formát souboru");
            }
          } else {
            alert("Neplatný formát souboru");
          }
        } catch (error) {
          alert("Chyba při čtení souboru: " + error.message);
        }
      };
      reader.readAsText(file);
    },
    [convertJsonToReservations, onReservationsChange, onSelectedIndexChange]
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
            <Form.Select
              size="sm"
              value={res.status}
              onChange={(e) => handleStatusChange(i, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="active">Aktivní</option>
              <option value="reserved">Rezervováno</option>
              <option value="blocked">Blokováno</option>
            </Form.Select>
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
};

export default DynamicGrid;
