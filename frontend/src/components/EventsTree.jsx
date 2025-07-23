import { Nav } from "react-bootstrap";
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
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconX } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

function EventsTree() {
  // Stav pro řazení, dotaz a vybraná města
  // Používáme useState pro uchování stavu komponenty
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "name",
    direction: "asc",
  });


  const [query, setQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  const [debouncedQuery] = useDebouncedValue(query, 200);

  // Používáme useMemo pro optimalizaci výkonu a zabránění zbytečným přepočtům
  // Vytvoříme unikátní seznam měst z datového souboru
  const cityOptions = useMemo(() => {
    const uniqueCities = new Set(dataFile.map((r) => r.city));
    return [...uniqueCities];
  }, []);

  const [records, setRecords] = useState([]);

  // Inicializujeme záznamy s daty z dataFile
  useEffect(() => {
    let filtered = dataFile;

    // Filtrování záznamů podle dotazu a vybraných měst
    if (debouncedQuery.trim() !== "") {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }

    // Filtrování záznamů podle vybraných měst
    if (selectedCities.length > 0) {
      filtered = filtered.filter((r) => selectedCities.includes(r.city));
    }

    // Řazení záznamů podle aktuálního stavu řazení
    // Používáme lodash sortBy pro řazení podle sloupce a směru
    // Pokud je řazení sestupné, obrátíme pořadí
    const sorted = sortBy(filtered, sortStatus.columnAccessor);
    setRecords(sortStatus.direction === "desc" ? sorted.reverse() : sorted);
  }, [sortStatus, debouncedQuery, selectedCities]);

  // Definujeme sloupce pro tabulku
  const squareColumns = [
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
      render: (row) => (
        <img
          src={row.image}
          alt={row.name}
          style={{ width: "100px", height: "auto", borderRadius: "8px" }}
        />
      ),
    },
    {
      accessor: "event_name",
      title: "Událost",
      render: (row) =>
        row.events?.length > 0 ? (
          <>
            {row.events.map((event, index) => (
              <Anchor
                key={event.id}
                href={`/events/${event.id}`}
                target="_blank"
                underline="hover"
              >
                {event.name}
                {index < row.events.length - 1 ? ", " : ""}
              </Anchor>
            ))}
          </>
        ) : (
          "—"
        ),
      sortable: true,
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
      />
    </Box>

    // Cena Int, Nazev String, Souřadnice,

    // Uředník, Event => Místo, období => Grid, Formulář
    // uredni square model clos rows rozliseni => Event => MarketSlot (označené pole na gridu)
    // seller => square => event => MarketSlot <= reservation == usera, id marketslotu, konec ,začátek
  );
}

export default EventsTree;
