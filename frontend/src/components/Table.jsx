import sortBy from "lodash/sortBy";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from "react";


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
  withTableBorder,
  borderRadius,
  highlightOnHover,
  verticalAlign,
  titlePadding = "6px 8px", // default smaller padding
  ...props
}) {
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: defaultSort,
    direction: "asc",
  });
  
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);
  const [filters, setFilters] = useState({});
  // Remove filter edit state, always show filter fields
  
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
    console.log(data)
    let filteredData = [...data];
    
    
    // Apply column filters (substring search, case-insensitive)
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        filteredData = filteredData.filter(item => {
          const cellValue = item[key];
          return cellValue !== undefined && String(cellValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    });
    
    // Apply sorting
    const sorted = sortBy(filteredData, sortStatus.columnAccessor);
    const sortedRecords = sortStatus.direction === "desc" 
      ? sorted.reverse() 
      : sorted;
    
    setRecords(sortedRecords);
  }, [data, sortStatus, debouncedQuery, filters]);

  // Enhanced columns with actions
  const enhancedColumns = [...columns];

  // Prepare columns for TanStack Table
  const tableColumns = useMemo(() =>
    enhancedColumns.map(col => ({
      accessorKey: col.accessor,
      header: col.title || col.accessor,
      cell: col.render ? info => col.render(info.row.original) : info => info.getValue(),
      enableSorting: col.accessor !== 'actions',
    })),
    [enhancedColumns]
  );

  // TanStack Table instance
  const table = useReactTable({
    data: records,
    columns: tableColumns,
    state: {
      sorting: sortStatus.columnAccessor ? [{
        id: sortStatus.columnAccessor,
        desc: sortStatus.direction === 'desc',
      }] : [],
    },
    onSortingChange: updater => {
      const sort = Array.isArray(updater) ? updater[0] : updater?.[0];
      if (sort) {
        setSortStatus({
          columnAccessor: sort.id,
          direction: sort.desc ? 'desc' : 'asc',
        });
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  });

  return (
    <div className="custom-table-wrapper">
      <table
        className={`custom-table${withTableBorder ? " table-bordered" : ""}`}
        style={{
          borderRadius,
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: "0.9rem",
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          {columns.map(col => (
            <col
              key={col.accessor}
              style={{ width: col.width || "auto" }}
            />
          ))}
        </colgroup>

        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.accessor || idx}
                style={{
                  padding: titlePadding,
                  textAlign: col.textAlign || "left",
                  minWidth: col.minWidth || undefined,
                  maxWidth: col.maxWidth || undefined,
                  // ...other style...
                }}
              >
                {col.title}
                {col.filter && <div style={{ marginTop: 2 }}>{col.filter}</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={table.getAllLeafColumns().length} style={{
                textAlign: 'center',
                padding: 24,
                color: '#888',
              }}>
                No data
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={{
                    padding: '10px 8px',
                    fontSize: 15,
                    width: cell.column.getSize(),
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;