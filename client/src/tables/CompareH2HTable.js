import React from 'react';
import { useTable } from 'react-table';
import styled from 'styled-components';

function CompareH2HTable(props) {
  const data = props.data;
  const currentWeek = props.currentWeek;
  const startWeek = props.startWeek;

  const numCompare = data.filter(
    (row) => row.rowHeader === data[0].rowHeader
  ).length;

  // columns are Weeks
  const columns = React.useMemo(() => {
    const weekArray = Array.from(
      { length: currentWeek - startWeek + 1 },
      (_, i) => startWeek + i
    );

    return [
      {
        Header: 'Week',
        columns: weekArray.map((week) => {
          return { Header: `${week}`, accessor: `week${week}` };
        }),
      },
    ];
  }, [currentWeek, startWeek]);

  columns.unshift({
    Header: 'Team',
    accessor: 'rowHeader',
  });

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;
  return (
    <Container>
      <TableContainer>
        <Table {...getTableProps()}>
          <thead>
            {
              // Loop over the header rows
              headerGroups.map((headerGroup) => (
                // Apply the header row props
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {
                    // Loop over the headers in each row
                    headerGroup.headers.map((column) => (
                      // Apply the header cell props
                      <th {...column.getHeaderProps()}>
                        {
                          // Render the header
                          column.render('Header')
                        }
                      </th>
                    ))
                  }
                </tr>
              ))
            }
          </thead>
          {/* Apply the table body props */}
          <tbody {...getTableBodyProps()}>
            {
              // Loop over the table rows
              rows.map((row) => {
                // Prepare the row for display
                prepareRow(row);

                // Conditional rendering for spanning row headers
                const rowIndex = row.index + 1;
                const isRowSpanned = rowIndex % numCompare;

                // Conditional rendering for background
                const vals = [];
                rows.forEach((filterRow) => {
                  const isSameHeader =
                    filterRow.values.rowHeader === row.values.rowHeader;
                  const isDifferentRow = filterRow.index !== row.index;
                  if (isSameHeader && isDifferentRow) {
                    vals.push(filterRow.values);
                  }
                });

                return (
                  // Apply the row props
                  <tr
                    {...row.getRowProps()}
                    style={{
                      borderBottom: !isRowSpanned
                        ? '4px solid black'
                        : '1px solid white',
                    }}
                  >
                    {row.cells.map((cell) => {
                      // Apply the cell props
                      const headerId = cell.column.id;
                      const isRowHeader = headerId === 'rowHeader';
                      const isWinner = cell.value === 'Won';
                      return (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            background: isWinner ? 'limegreen' : 'gainsboro',
                            fontWeight: isRowHeader ? 'bold' : 'normal',
                          }}
                        >
                          {
                            // Render the cell contents
                            cell.render('Cell')
                          }
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            }
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 0.25rem;
`;

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding: 0 1px;
  overflow: auto;
`;

const Table = styled.table`
  font-family: Arial;
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  color: black;

  border-collapse: collapse;
  border-spacing: 0;
  border: 1px solid white;

  th {
    background: silver;
    color: black;
  }

  tr {
    :last-child {
      td {
        border-bottom: 0;
      }
    }
  }

  th,
  td {
    margin: 0;
    padding: 0.25rem;
    border-bottom: 1px solid white;
    border-right: 1px solid white;

    :last-child {
      border-right: 0;
    }
  }
`;

export default CompareH2HTable;
