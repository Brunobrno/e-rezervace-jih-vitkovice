import Table from "../components/Table";
import Sidebar from "../components/Sidebar";
import {
  ActionIcon,
  Button,
  MultiSelect,
  Stack,
  TextInput,
  Text,
  Group,
} from "@mantine/core";
import { IconSearch, IconX, IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";

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
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Form,
  Row,
  Col,
} from "react-bootstrap";

import { getEvents } from "../api/model/event";

function Events() {
  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [selectedCities, setSelectedCities] = useState([]);

  const fetchEvents = async () => {
    setFetching(true);
    try {
      const params = {};
      if (debouncedQuery) params.search = debouncedQuery;
      if (selectedCities.length > 0) params.city = selectedCities;
      const data = await getAllEvents(params);
      setEvents(data);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const cityOptions = useMemo(() => {
    const cities = new Set(events.map((e) => e.square?.city).filter(Boolean));
    return [...cities];
  }, [events]);

  const handleShowEvent = (event) => {
    console.log("Zobrazit detail události", event);
    // TODO: Implementuj modální zobrazení
  };

  const handleEditEvent = (event) => {
    console.log("Editace události", event);
    // TODO: Implementuj formulář pro editaci
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm(`Opravdu smazat událost: ${event.name}?`)) {
      await deleteEvent(event.id);
      fetchEvents();
    }
  };

  const columns = [
    { accessor: "id", title: "#", sortable: true },
    { accessor: "name", title: "Název", sortable: true },
    {
      accessor: "description",
      title: "Popis",
      render: (row) => row.description || <Text c="dimmed" fs="italic">Bez popisu</Text>,
    },
    {
      accessor: "square",
      title: "Náměstí",
      render: (row) => row.square?.name || <Text c="dimmed" fs="italic">Neznámé</Text>,
    },
    {
      accessor: "city",
      title: "Město",
      sortable: true,
      render: (row) => row.square?.city || "-",
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
      accessor: "start",
      title: "Začátek",
      render: (row) => new Date(row.start).toLocaleString(),
      sortable: true,
    },
    {
      accessor: "end",
      title: "Konec",
      render: (row) => new Date(row.end).toLocaleString(),
      sortable: true,
    },
    {
      accessor: "actions",
      title: "Akce",
      render: (event) => (
        <Group gap={4} wrap="nowrap">
          <ActionIcon
            size="sm"
            variant="subtle"
            color="green"
            onClick={() => handleShowEvent(event)}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="blue"
            onClick={() => handleEditEvent(event)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            onClick={() => handleDeleteEvent(event)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const renderModalContent = (record, closeModal) => (
    <Stack>
      <Text><strong>ID:</strong> {record.id}</Text>
      <Text><strong>Název:</strong> {record.name}</Text>
      <Text><strong>Popis:</strong> {record.description}</Text>
      <Text><strong>Město:</strong> {record.square?.city || "-"}</Text>
      <Text><strong>Od:</strong> {new Date(record.start).toLocaleString()}</Text>
      <Text><strong>Do:</strong> {new Date(record.end).toLocaleString()}</Text>
      <Group mt="md">
        <Button variant="outline" onClick={closeModal}>Zavřít</Button>
        <Button color="blue">Upravit</Button>
      </Group>
    </Stack>
  );

  return (
    <Container fluid className="p-0 d-flex flex-column" style={{ overflowX: "hidden", height: "100vh" }}>
      <Row className="mx-0 flex-grow-1">
        <Col xs={2} className="px-0 bg-light" style={{ minWidth: 0 }}>
          <Sidebar />
        </Col>
        <Col xs={10} className="px-0 bg-white d-flex flex-column" style={{ minWidth: 0 }}>
          <Table
            data={events}
            columns={columns}
            fetching={fetching}
            modalTitle="Detail události"
            renderModalContent={renderModalContent}
            withTableBorder
            borderRadius="md"
            highlightOnHover
            verticalAlign="center"
          />
        </Col>
      </Row>
    </Container>
  );
}

export default Events;
