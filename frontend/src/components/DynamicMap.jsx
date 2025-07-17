import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const MyResponsiveGrid = () => {

const maxGridHeight = 700; // Your fixed height
const rowHeight = 30; // Should match your rowHeight prop
const maxRows = Math.floor(maxGridHeight / rowHeight) - 6;

  const [layoutData, setLayoutData] = useState([]);
  const [lockMode, setLockMode] = useState(false);

 const cleanLayout = (layout) => {
  return layout.map(item => {
    if (item.y + item.h > maxRows) {
      return { ...item, y: Math.max(0, maxRows - item.h) };
    }
    return item;
  });
};

const handleLayoutChange = (currentLayout) => {
  const filtered = currentLayout.filter(item => item.i !== "__dropping-elem__");
  const cleaned = cleanLayout(filtered);
  setLayoutData(cleaned);
};

  const handleDrop = (layout, layoutItem, _event) => {
  const newItemId = new Date().getTime().toString();
  const { w = 2, h = 2, status } = JSON.parse(_event.dataTransfer.getData("text/plain")) || {};
  
  // Prevent dropping below max rows
  if (layoutItem.y + h > maxRows) {
    layoutItem.y = Math.max(0, maxRows - h);
  }

  const newItem = {
    i: newItemId,
    x: layoutItem.x,
    y: layoutItem.y,
    w,
    h,
    static: status === "reserved" || status === "blocked",
    status,
  };
  setLayoutData((prev) => [...prev, newItem]);
};

  const toggleLockMode = () => setLockMode(prev => !prev);

  const handleItemClick = (id) => {
    if (!lockMode) return;
    setLayoutData(prev =>
      prev.map(item =>
        item.i === id ? { ...item, static: !item.static } : item
      )
    );
  };

  const getItemClass = (item) => {
    if (item.status === "reserved") return "bg-warning";
    if (item.status === "blocked") return "bg-danger";
    return "bg-white";
  };

  return (
    <div className="p-4 flex gap-4">
      <div className="flex flex-col gap-2">
        <button
          onClick={toggleLockMode}
          className="mb-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          {lockMode ? "Exit Lock Mode" : "Enter Lock Mode"}
        </button>

        <div
          className="droppable-element"
          draggable={true}
          unselectable="on"
          onDragStart={(e) => {
            e.dataTransfer.setData(
              "text/plain",
              JSON.stringify({ w: 2, h: 2 })
            );
          }}
        >
          Free
        </div>
        <div
          className="droppable-element bg-warning"
          draggable={true}
          unselectable="on"
          onDragStart={(e) => {
            e.dataTransfer.setData(
              "text/plain",
              JSON.stringify({ w: 3, h: 2, status: "reserved" })
            );
          }}
        >
          Reserved Block
        </div>
        <div
          className="droppable-element bg-danger"
          draggable={true}
          unselectable="on"
          onDragStart={(e) => {
            e.dataTransfer.setData(
              "text/plain",
              JSON.stringify({ w: 3, h: 2, status: "blocked" })
            );
          }}
        >
          Blocked Block
        </div>
      </div>

      <ResponsiveGridLayout
        style={{ width: "800px", height: `${maxGridHeight}px`, overflow: "hidden" }}
        className="layout bg-secondary"
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={rowHeight}
        width={1200}
        autoSize={false}  
        maxRows={maxRows} // This prevents visual overflow
        useCSSTransforms={true}
        onLayoutChange={handleLayoutChange}
        isDroppable={true}
        onDrop={handleDrop}
        layout={layoutData}
      >
        {layoutData.map((item) => (
          <div
            key={item.i}
            data-grid={item}
            onClick={() => handleItemClick(item.i)}
            className={`${getItemClass(item)} p-2 border rounded text-center cursor-pointer`}
          >
            Item {item.i} {item.static ? "(Locked)" : ""}
          </div>
        ))}
      </ResponsiveGridLayout>

      <pre className="mt-4 text-sm text-dark">
        {JSON.stringify(layoutData, null, 2)}
      </pre>
    </div>
  );
};

export default MyResponsiveGrid;
