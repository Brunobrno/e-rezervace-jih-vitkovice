import { Nav, Modal } from "react-bootstrap";
import logo from "/img/logo.png";
import dataFile from "../assets/json/data.json";
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

  // Používáme useMemo pro optimalizaci výkonu a zabránění zbytečným přepočtům
  // Vytvoříme unikátní seznam měst z datového souboru
  const cityOptions = useMemo(() => {
    const uniqueCities = new Set(dataFile.map((r) => r.city));
    return [...uniqueCities];
  }, []);

  useEffect(() => {
    setSquares(dataFile);
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
  }, []);

  // Inicializujeme záznamy s daty z dataFile
  useEffect(() => {
    let filtered = squares;

    if (debouncedQuery.trim() !== "") {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }

    if (selectedCities.length > 0) {
      filtered = filtered.filter((r) => selectedCities.includes(r.city));
    }

    const sorted = sortBy(filtered, sortStatus.columnAccessor);
    setRecords(sortStatus.direction === "desc" ? sorted.reverse() : sorted);
  }, [sortStatus, debouncedQuery, selectedCities, squares]);

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
  const squareColumns = [
    { accessor: "id", title: "#", sortable: true},
    { accessor: "street", title: "Ulice", sortable: true },
    {
      accessor: "name",
      title: "Název",
      sortable: true,
      filter: (
        <TextInput
          label="Hledat názvy"
          placeholder="Např. Trh, Koncert..."
          leftSection={<IconSearch size={16} />}
          rightSection={
            <ActionIcon
              size="sm"
              variant="transparent"
              c="dimmed"
              onClick={() => setQuery("")}
            >
              <IconX size={14} />
            </ActionIcon>
          }
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
      ),
      filtering: query !== "",
    },
    {
      accessor: "city",
      title: "Město",
      sortable: true,
      filter: (
        <MultiSelect
          label="Filtrovat města"
          placeholder="Vyber město/města"
          data={cityOptions}
          value={selectedCities}
          onChange={setSelectedCities}
          clearable
          searchable
          leftSection={<IconSearch size={16} />}
          comboboxProps={{ withinPortal: false }}
        />
      ),
      filtering: selectedCities.length > 0,
    },
    {
      accessor: "image",
      title: "Obrázek",
      render: (row) =>
        row.image ? (
          <img
            src={row.image}
            alt={row.name}
            style={{ width: "100px", height: "auto", borderRadius: "8px" }}
          />
        ) : (
          <Text c="dimmed" fs="italic">
            Žádný obrázek
          </Text>
        ),
    },
    {
      accessor: "events",
      title: "Počet událostí",
      width: "0%",
      textAlign: "center",
      render: (row) => row.events?.length || 0,
      sortable: true,
    },
    {
      accessor: "actions",
      title: "Akce",
      width: "0%",

      render: (square) => (
        <Group gap={4} wrap="nowrap">
          <ActionIcon
            size="sm"
            variant="subtle"
            color="green"
            onClick={() => handleShowEvent(square)}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="blue"
            onClick={() => handleEditEvent(square)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            onClick={() => handleDeleteEvent(square)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const eventColumns = [
    { accessor: "id", title: "#", sortable: true },
    { accessor: "name", title: "Název", sortable: true },
    { accessor: "description", title: "Popis", sortable: true },
    { accessor: "start", title: "Začátek", sortable: true },
    { accessor: "end", title: "Konec", sortable: true },
    { accessor: "price_per_m2", title: "Cena za m2", sortable: true },
    { accessor: "market_slots", title: "Plochy", sortable: true },
  ];

  return (
    <>
      <Box>
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
        />
      </Box>
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent}</Modal.Body>
      </Modal>
    </>

    // Cena Int, Nazev String, Souřadnice,

    // Uředník, Event => Místo, období => Grid, Formulář
    // uredni square model clos rows rozliseni => Event => MarketSlot (označené pole na gridu)
    // seller => square => event => MarketSlot <= reservation == usera, id marketslotu, konec ,začátek
  );
}

export default EventsTree;
