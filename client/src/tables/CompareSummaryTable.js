import React from 'react';
import { useTable } from 'react-table';
import styled from 'styled-components';
import { getCatInverse } from '../utils/categoryUtils';

function CompareSummaryTable(props) {
  const data = props.data;

  const numCompare = data.filter(
    (row) => row.rowHeader === data[0].rowHeader
  ).length;

  const columns = React.useMemo(
    () => [
      {
        Header: 'Summary',
        columns: [
          {
            Header: 'Wins',
            accessor: 'wins'
          },
          {
            Header: 'Mean',
            accessor: 'mean',
          },
          {
            Header: 'StDev',
            accessor: 'stdev'
          },
          {
            Header: 'Min',
            accessor: 'min',
          },
          {
            Header: 'Max',
            accessor: 'max',
          },
        ],
      },
    ],
    []
  );

  columns.unshift({
    Header: '',
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
                //console.log(rows);
                //console.log(row);
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
                    {
                      // Loop over the rows cells
                      row.cells.map((cell) => {
                        //console.log(cell);
                        // Conditional rendering for row header span
                        const headerId = cell.column.id;
                        const isRowHeader = headerId === 'rowHeader';

                        if (isRowHeader & !isRowSpanned) return null;

                        // Conditional rendering for background
                        const compare = vals.map((val) => {
                          return val[headerId];
                        });

                        let isLargest;                        
                        const catID = cell.row.original.catId;
                        if (getCatInverse(catID)) {
                          isLargest = cell.value < Math.min(...compare);
                        } else {
                          isLargest = cell.value > Math.max(...compare);
                        }
                        
                        let noColor;
                        if (headerId === "stdev") {
                          noColor = true;
                        }

                        // Apply the cell props
                        return (
                          <td
                            {...cell.getCellProps()}
                            style={{
                              background: (!noColor & isLargest) ? 'limegreen' : 'gainsboro',
                              fontWeight: isRowHeader ? 'bold' : 'normal',
                            }}
                            rowSpan={
                              isRowHeader & isRowSpanned ? numCompare : 1
                            }
                          >
                            {
                              // Render the cell contents
                              cell.render('Cell')
                            }
                          </td>
                        );
                      })
                    }
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

  padding: 0.25rem;
`;

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

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

export default CompareSummaryTable;
