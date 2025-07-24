import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader, Center } from '@mantine/core'; // přidáno pro loading spinner
import MultiPurpouseTable from "../components/Multipurpouse-table";

import squareAPI from "../api/model/square";
import eventAPI from "../api/model/event";

const modelMap = {
  square: {
    api: squareAPI,
    fetchMethod: "getSquares",
    deleteMethod: "deleteSquare",
    updateMethod: "updateSquare",
    columns: [
      { accessor: "id", title: "ID", editable: false },
      { accessor: "name", title: "Název", editable: true, type: "text" },
      { accessor: "city", title: "Město", editable: true, type: "text" },
      { accessor: "width", title: "Šířka", editable: true, type: "number" },
      { accessor: "height", title: "Výška", editable: true, type: "number" },
    ],
    allowDelete: true,
  },

  event: {
    api: eventAPI,
    fetchMethod: "getEvents",
    deleteMethod: "deleteEvent",
    updateMethod: "updateEvent",
    columns: [
      { accessor: "id", title: "ID", editable: false },
      { accessor: "name", title: "Název", editable: true },
      { accessor: "start_date", title: "Začátek", editable: true, type: "datetime-local" },
      { accessor: "end_date", title: "Konec", editable: true, type: "datetime-local" },
    ],
    allowDelete: true,
  },
};

export default function TablePage() {
  const { modelName } = useParams();
  const config = modelMap[modelName];

  const [data, setData] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!config) return;

    const fetchData = async () => {
      setFetching(true);
      try {
        const response = await config.api[config.fetchMethod]();
        console.log("Response: ",response);
        setData(response?.results ?? response ?? []);
      } catch (error) {
        console.error("Chyba při načítání:", error);
        setData([]);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [modelName, config]);

  if (!config) {
    return <div>Model "{modelName}" není podporován.</div>;
  }

  if (fetching) {
    console.log("načítaní...");
    return (
      <Center style={{ height: 200 }}>
        <Loader variant="dots" size="xl" />
      </Center>
    );
  }

  return (
    <MultiPurpouseTable
      data={data}
      columns={config.columns}
      fetching={fetching}
      allowDelete={config.allowDelete}
      onDelete={(id) => config.api[config.deleteMethod](id)}
      onUpdate={(id, values) => config.api[config.updateMethod](id, values)}
    />
  );
}
