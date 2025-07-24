import React, { useState, useEffect, useRef } from 'react';
import {
  ActionIcon,
  Box,
  Group,
  Text,
  TextInput,
  Button,
} from '@mantine/core';
import {
  IconSearch,
  IconX,
  IconEdit,
  IconTrash,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { useDebouncedValue } from '@mantine/hooks';
import { Modal } from 'react-bootstrap';

function MultiPurpouseTable({
  data = [],
  columns = [],
  fetching = false,
  defaultSort = 'id',
  modalTitle = 'Details',
  renderModalContent,
  onQueryChange,
  initialQuery = '',
  withGlobalSearch = true,
  withActionsColumn = true,
  onUpdate,
  onDelete,
  allowDelete = true,
  ...props
}) {

  const [sortStatus, setSortStatus] = useState({
    columnAccessor: defaultSort,
    direction: 'asc',
  });

  const [records, setRecords] = useState([]);
  const prevRecordsRef = useRef([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [filters, setFilters] = useState({});

  const [editRowId, setEditRowId] = useState(null);
  const [originalValues, setOriginalValues] = useState({});

  // Ref na jednotlivé inputy při editaci
  const inputRefs = useRef({});

  useEffect(() => {
    if (onQueryChange) onQueryChange(query);
  }, [query, onQueryChange]);

  useEffect(() => {
    console.log("Data: ", data);
    if (!data || data.length === 0) {
      if (prevRecordsRef.current.length !== 0) {
        setRecords([]);
        prevRecordsRef.current = [];
      }
      return;
    }

    let filteredData = [...data];

    if (debouncedQuery) {
      filteredData = filteredData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(debouncedQuery.toLowerCase())
        )
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        filteredData = filteredData.filter((item) => value.includes(item[key]));
      }
    });

    const sorted = sortBy(filteredData, sortStatus.columnAccessor);
    const sortedRecords =
      sortStatus.direction === 'desc' ? sorted.reverse() : sorted;

    const areRecordsSame =
      prevRecordsRef.current.length === sortedRecords.length &&
      prevRecordsRef.current.every((rec, i) => rec === sortedRecords[i]);

    if (!areRecordsSame) {
      setRecords(sortedRecords);
      prevRecordsRef.current = sortedRecords;
    }
  }, [data, sortStatus, debouncedQuery, filters]);

  const handleOpenModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const enhancedColumns = [...columns];

  if (withGlobalSearch && !columns.some((col) => col.isSearch)) {
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
                onClick={() => setQuery('')}
              >
                <IconX size={14} />
              </ActionIcon>
            )
          }
        />
      ),
      filtering: query !== '',
    });
  }

  if (withActionsColumn) {
    enhancedColumns.push({
      accessor: 'actions',
      title: 'Akce',
      textAlign: 'right',
      render: (record) => {
        const isEditing = editRowId === record.id;

        return (
          <Group gap="xs" justify="end" wrap="nowrap">
            {isEditing ? (
              <>
                <Button
                  size="xs"
                  color="green"
                  onClick={() => {
                    // Načteme hodnoty z inputů přes ref
                    const newValues = {};
                    columns.forEach((col) => {
                      if (col.editable) {
                        const input = inputRefs.current[col.accessor];
                        newValues[col.accessor] = input ? input.value : '';
                      }
                    });

                    const hasEmptyRequired = columns.some(
                      (col) => col.editable && col.required && !newValues[col.accessor]
                    );
                    if (hasEmptyRequired) {
                      alert('Vyplňte prosím všechna povinná pole.');
                      return;
                    }

                    onUpdate?.(record.id, newValues)
                        .then(() => {
                            alert('Záznam byl úspěšně upraven.');

                            // Aktualizuj lokální records - přepiš jen ten jeden řádek podle id
                            setRecords((prev) =>
                            prev.map((rec) =>
                                rec.id === record.id ? { ...rec, ...newValues } : rec
                            )
                            );

                            setEditRowId(null);
                            setOriginalValues({});
                            inputRefs.current = {};
                        })
                        .catch(() => {
                            alert('Úprava selhala, zkuste to prosím znovu.');
                        });
                    }}
                >
                  Potvrdit
                </Button>
                <Button
                  size="xs"
                  color="gray"
                  onClick={() => {
                    setEditRowId(null);
                    setOriginalValues({});
                    inputRefs.current = {};
                  }}
                >
                  Zrušit
                </Button>
              </>
            ) : (
              <>
                <ActionIcon
                  color="blue"
                  onClick={() => {
                    // Inicializace originalValues
                    const initialOriginalValues = {};
                    columns.forEach((col) => {
                      if (col.editable) {
                        initialOriginalValues[col.accessor] = record[col.accessor] ?? '';
                      }
                    });
                    setEditRowId(record.id);
                    setOriginalValues(initialOriginalValues);
                    inputRefs.current = {};
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                {allowDelete && (
                  <ActionIcon
                    color="red"
                    onClick={() => {
                      if (
                        window.confirm(`Opravdu smazat záznam #${record.id}?`)
                      ) {
                        onDelete?.(record.id);
                      }
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </>
            )}
          </Group>
        );
      },
    });
  }

  const editableColumns = enhancedColumns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      render: (record) => {
        if (editRowId === record.id) {
          return (
            <input
              type={col.type || 'text'}
              defaultValue={originalValues[col.accessor] ?? ''}
              required={col.required || false}
              ref={(el) => {
                if (el) {
                  inputRefs.current[col.accessor] = el;
                }
              }}
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          );
        }
        return record[col.accessor];
      },
    };
  });

  return (
    <Box className="d-flex flex-column h-100" style={{ minHeight: 400 }}>
      <DataTable
        records={records}
        columns={editableColumns}
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
        show={isModalOpen}
        onHide={handleCloseModal}
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

export default MultiPurpouseTable;
