import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

const MyResponsiveGrid = () => {
  const [layoutData, setLayoutData] = useState([]);


  const handleLayoutChange = (currentLayout) => {
    setLayoutData(currentLayout);
    console.log("Current Layout:", currentLayout);
  };
  return (
    <div className="p-4">

      <ResponsiveGridLayout
      style={{ width: "800px", minHeight: "700px" }}
        className="layout  bg-secondary "
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        width={1200}
        useCSSTransforms={true}
        onLayoutChange={handleLayoutChange}
      >
        
      </ResponsiveGridLayout>

      <pre className="mt-4 text-sm text-dark">
        {JSON.stringify(layoutData, null, 2)}
      </pre>
    </div>
  );
};

export default MyResponsiveGrid;