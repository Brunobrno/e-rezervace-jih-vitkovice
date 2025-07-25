import { Nav, Modal } from "react-bootstrap";
import logo from "/img/logo.png";
import sortBy from "lodash/sortBy";
import {
  ActionIcon,
  Button,
  Checkbox,
  MultiSelect,
  Stack,
  TextInput,
  Anchor,
  Box,
  Group,
  Text,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconSearch,
  IconX,
  IconEye,
  IconEdit,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

import { getSquares }  from '../api/model/square';

function EventsTree() {
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "id",
    direction: "asc",
  });

  const [query, setQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [events, setEvents] = useState([]);
  const [squares, setSquares] = useState([]);
  const [records, setRecords] = useState([]);
  const [dataFile, setDataFile] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSquares();
        setDataFile(data);
        setSquares(data); // Initialize squares with fetched data
      } catch (err) {
        console.error("Chyba při načítání:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  console.log("Data loaded:", records);
  // Používáme useMemo pro optimalizaci výkonu a zabránění zbytečným přepočtům
  // Vytvoříme unikátní seznam měst z datového souboru
  const cityOptions = useMemo(() => {
    const uniqueCities = new Set(dataFile.map((r) => r.city));
    return [...uniqueCities];
  }, []);

  useEffect(() => {
    const allEvents = dataFile.flatMap(
      (square) =>
        square.events?.map((event) => ({
          ...event,
          squareId: square.id,
          squareName: square.name,
          city: square.city,
        })) || []
    );
    setEvents(allEvents);
  }, [dataFile]); // Add dependency

  // Inicializujeme záznamy s daty z dataFile
  useEffect(() => {
    if (!squares.length) return; // Skip if no data

    let filtered = [...squares]; // Use latest squares data

    // Apply filters
    if (debouncedQuery.trim() !== "") {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }

    if (selectedCities.length > 0) {
      filtered = filtered.filter((r) => selectedCities.includes(r.city));
    }

    // Apply sorting
    const sorted = sortBy(filtered, sortStatus.columnAccessor);
    setRecords(sortStatus.direction === "desc" ? sorted.reverse() : sorted);
  }, [sortStatus, debouncedQuery, selectedCities, squares]); // Include squares

  const handleCloseModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const handleShowEvent = (event) => {
    setModalTitle("Detaily události");
    setModalContent(
      <div>
        <Text size="sm" fw={700}>
          Název:
        </Text>
        <Text mb="sm">{event.name}</Text>

        <Text size="sm" fw={700}>
          Popis:
        </Text>
        <Text mb="sm">{event.description || "—"}</Text>

        <Text size="sm" fw={700}>
          Začátek:
        </Text>
        <Text mb="sm">{dayjs(event.start).format("DD.MM.YYYY HH:mm")}</Text>

        <Text size="sm" fw={700}>
          Konec:
        </Text>
        <Text mb="sm">{dayjs(event.end).format("DD.MM.YYYY HH:mm")}</Text>

        <Text size="sm" fw={700}>
          Cena za m²:
        </Text>
        <Text mb="sm">{event.price_per_m2} Kč</Text>
      </div>
    );
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setModalTitle("Upravit událost");
    setModalContent(
      <Stack>
        <TextInput label="Název" defaultValue={event.name} />
        <TextInput label="Popis" defaultValue={event.description} />
        <DatePicker label="Začátek" defaultValue={new Date(event.start)} />
        <DatePicker label="Konec" defaultValue={new Date(event.end)} />
        <TextInput
          label="Cena za m²"
          type="number"
          defaultValue={event.price_per_m2}
        />
        <Button mt="md" onClick={handleCloseModal}>
          Uložit změny
        </Button>
      </Stack>
    );
    setShowModal(true);
  };

  const handleDeleteEvent = (event) => {
    setModalTitle("Smazat událost");
    setModalContent(
      <Stack>
        <Text>Opravdu chcete smazat událost "{event.name}"?</Text>
        <Group mt="md">
          <Button variant="outline" onClick={handleCloseModal}>
            Zrušit
          </Button>
          <Button
            color="red"
            onClick={() => {
              // Delete logic here
              handleCloseModal();
            }}
          >
            Smazat
          </Button>
        </Group>
      </Stack>
    );
    setShowModal(true);
  };

  const handleAddEvent = () => {
    setModalTitle("Přidat novou událost");
    setModalContent(
      <Stack>
        <TextInput label="Název" placeholder="Název události" />
        <TextInput label="Popis" placeholder="Popis události" />
        <DatePicker label="Začátek" />
        <DatePicker label="Konec" />
        <TextInput label="Cena za m²" type="number" placeholder="Cena" />
        <MultiSelect
          label="Přiřadit k tržišti"
          data={squares.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Button mt="md" onClick={handleCloseModal}>
          Vytvořit událost
        </Button>
      </Stack>
    );
    setShowModal(true);
  };
  // Definujeme sloupce pro tabulku
  


  return (
    <div className="d-flex flex-column h-100"> {/* Flex container */}
      <Box className="flex-grow-1" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0 // Important for overflow
      }}>
        <DataTable
          records={records}
          columns={squareColumns}
          withTableBorder
          borderRadius="md"
          shadow="sm"
          highlightOnHover
          verticalAlign="center"
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          idAccessor="id"
          fetching={fetching}
          height="100%" // Make table fill container
          scrollAreaProps={{ 
            style: { 
              height: '100%',
              flex: 1 
            } 
          }}
          style={{ flex: 1 }} // Expand to fill space
        />
      </Box>
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent}</Modal.Body>
      </Modal>
    </div>

    // Cena Int, Nazev String, Souřadnice,

    // Uředník, Event => Místo, období => Grid, Formulář
    // uredni square model clos rows rozliseni => Event => MarketSlot (označené pole na gridu)
    // seller => square => event => MarketSlot <= reservation == usera, id marketslotu, konec ,začátek
  );
}

export default EventsTree;
