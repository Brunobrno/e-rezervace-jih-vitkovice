import { Nav } from "react-bootstrap";
import logo from "../assets/img/logo.png";
import dataFile from "../assets/json/data.json";
import React, { useState, useEffect } from "react";
import { Box } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { Anchor } from "@mantine/core";

function EventsTree() {
  console.log(dataFile);

  const columns = [
    { accessor: "id", title: "ID" },
    { accessor: "name", title: "Název" },
    { accessor: "city", title: "Město" },
    { accessor: "street", title: "Ulice" },
    { accessor: "name", title: "Název" },
    { accessor: "img", title: "Obrázek" },
    {
      accessor: "events",
      title: "Událost",
      render: (row) =>
        row.events?.[0] ? (
          <Anchor
            href={`/events/${row.events[0].id}`}
            target="_blank"
            underline="hover"
          >
            {row.events[0].name}
          </Anchor>
        ) : (
          "—"
        ),
    },
  ];
  return (
    <Box>
      <DataTable
        records={dataFile}
        columns={columns}
        withBorder
        withColumnBorders
        striped
        highlightOnHover
      />
    </Box>

    // Cena Int, Nazev String, Souřadnice,

    // Uředník, Event => Místo, období => Grid, Formulář
    // uredni square model clos rows rozliseni => Event => MarketSlot (označené pole na gridu)
    // seller => square => event => MarketSlot <= reservation == usera, id marketslotu, konec ,začátek
  );
}

export default EventsTree;
