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

import { getAllSquares } from "../api/model/square";

function Table({
  data = [],
  columns = [],
  fetching = false,
  defaultSort = "id",
  modalTitle = "Details",
  renderModalContent,
  onQueryChange,
  initialQuery = "",
  withGlobalSearch = true,
  withActionsColumn = true,
  ...props
}) {
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: defaultSort,
    direction: "asc",
  });
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [filters, setFilters] = useState({});
  
  // Expose query changes to parent
  useEffect(() => {
    if (onQueryChange) {
      onQueryChange(query);
    }
  }, [query, onQueryChange]);
  
  // Apply sorting and filtering
  useEffect(() => {
    if (!data || data.length === 0) {
      setRecords([]);
      return;
    }

    let filteredData = [...data];
    
    // Apply global search
    if (debouncedQuery) {
      filteredData = filteredData.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(debouncedQuery.toLowerCase())
        )
      );
    }
    
    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        filteredData = filteredData.filter(item => 
          value.includes(item[key])
        );
      }
    });
    
    // Apply sorting
    const sorted = sortBy(filteredData, sortStatus.columnAccessor);
    const sortedRecords = sortStatus.direction === "desc" 
      ? sorted.reverse() 
      : sorted;
    
    setRecords(sortedRecords);
  }, [data, sortStatus, debouncedQuery, filters]);

  const handleOpenModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  // Enhanced columns with actions
  const enhancedColumns = [...columns];
  
  // Add global search column if enabled
  if (withGlobalSearch && !columns.some(col => col.isSearch)) {
    enhancedColumns.unshift({
      accessor: 'search',
      title: 'Search',
      isSearch: true,
      filter: (
        <TextInput
          placeholder="Search all columns..."
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          rightSection={
            query && (
              <ActionIcon
                size="sm"
                variant="transparent"
                color="dimmed"
                onClick={() => setQuery("")}
              >
                <IconX size={14} />
              </ActionIcon>
            )
          }
        />
      ),
      filtering: query !== "",
    });
  }

  return (
    <Box className="d-flex flex-column h-100" style={{ minHeight: 400 }}>
      <DataTable
        records={records}
        columns={enhancedColumns}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        fetching={fetching}
        height="100%"
        scrollAreaProps={{ style: { flex: 1 } }}
        style={{ flex: 1 }}
        onRowClick={withActionsColumn ? undefined : handleOpenModal}
        {...props}
      />
      
      <Modal 
        opened={isModalOpen} 
        onClose={handleCloseModal}
        title={modalTitle}
        size="lg"
        centered
      >
        {selectedRecord && renderModalContent ? (
          renderModalContent(selectedRecord, handleCloseModal)
        ) : (
          <Text>No details available</Text>
        )}
      </Modal>
    </Box>
  );
}

export default Table;