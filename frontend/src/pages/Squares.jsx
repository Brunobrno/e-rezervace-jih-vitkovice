import Table from "../components/Table";
import Sidebar from "../components/Sidebar";
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
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Form,
  Row,
  Col,
} from "react-bootstrap";

import { getAllSquares } from "../api/model/square";

function Squares() {
  const [squares, setSquares] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllSquares();
        setSquares(data);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const cityOptions = useMemo(() => {
    const uniqueCities = new Set(squares.map((r) => r.city));
    return [...uniqueCities];
  }, [squares]);

  // Define columns
  const columns = [
    { accessor: "id", title: "#", sortable: true },
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

  // Render modal content
  const renderModalContent = (record, closeModal) => (
    <Stack>
      <Text>
        <strong>ID:</strong> {record.id}
      </Text>
      <Text>
        <strong>Name:</strong> {record.name}
      </Text>
      <Text>
        <strong>City:</strong> {record.city}
      </Text>
      <Text>
        <strong>Events:</strong> {record.events?.length || 0}
      </Text>

      <Group mt="md">
        <Button variant="outline" onClick={closeModal}>
          Close
        </Button>
        <Button color="blue">Edit</Button>
      </Group>
    </Stack>
  );

  return (
    <Container
      fluid
      className="p-0 d-flex flex-column"
      style={{
        overflowX: "hidden",
        height: "100vh", // Full viewport height
      }}
    >
      <Row className="mx-0 flex-grow-1">
        {" "}
        {/* Make row grow to fill space */}
        <Col xs={2} className="px-0 bg-light" style={{ minWidth: 0 }}>
          <Sidebar />
        </Col>
        <Col
          xs={10}
          className="px-0 bg-white d-flex flex-column"
          style={{ minWidth: 0 }}
        >
          <Table
            data={squares}
            columns={columns}
            fetching={fetching}
            modalTitle="Square Details"
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

export default Squares;
