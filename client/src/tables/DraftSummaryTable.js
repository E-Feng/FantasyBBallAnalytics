import React from 'react';
import { useTable } from 'react-table';
import styled from 'styled-components';

import { getHSLColor } from '../utils/colorsUtil';

function DraftSummaryTable(props) {
  const data = props.data;
  const ratingsColorRange = props.range;

  data.sort((a, b) => b.avgRating - a.avgRating);

  const diffColorRange = [-100, 100];

  const columns = React.useMemo(
    () => [
      {
        Header: 'Rank',
        accessor: 'seed',
      },
      {
        Header: 'Team',
        accessor: 'fullTeamName',

        Cell: (props) => (
          <React.Fragment>{props.value.substring(0, 20)}</React.Fragment>
        ),
      },
      {
        Header: 'Ranking',
        accessor: 'avgRanking',
      },
      {
        Header: 'Rating',
        accessor: 'avgRating',

        Cell: (props) => (
          <React.Fragment>
            {props.value ? parseFloat(props.value).toFixed(2) : ''}
          </React.Fragment>
        ),
      },
      {
        Header: 'Difference',
        accessor: 'avgDifference',
        
        Cell: (props) => (
          <React.Fragment>
            {props.value ? parseFloat(props.value).toFixed(0) : ''}
          </React.Fragment>
        ),
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <Container>
      <Table {...getTableProps()}>
        <thead>
          {
            // Loop over the header rows
            headerGroups.map((headerGroup) => (
              // Apply the header row props
              <tr {...headerGroup.getHeaderGroupProps()}>
                {
                  // Loop over the headers in each row
                  headerGroup.headers.map((column) => {
                    //const isCat = cats.includes(column.id);
                    return (
                      // Apply the header cell props
                      <th
                        {...column.getHeaderProps()}
                        style={
                          {
                            //minWidth: isCat ? '25px' : '0px',
                          }
                        }
                      >
                        {
                          // Render the header
                          column.render('Header')
                        }
                      </th>
                    );
                  })
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
              return (
                // Apply the row props
                <tr {...row.getRowProps()}>
                  {
                    // Loop over the rows cells
                    row.cells.map((cell) => {
                      // Conditional background color rendering
                      const headerId = cell.column.id;

                      const val = cell.value;
                      let color = 'gainsboro';

                      if (val !== null) {
                        if (headerId === 'avgDifference') {
                          color = getHSLColor(
                            val,
                            diffColorRange[0],
                            diffColorRange[1]
                          );
                        } else if (headerId === 'avgRating') {
                          color = getHSLColor(
                            val,
                            ratingsColorRange[0],
                            ratingsColorRange[1]
                          );
                        }
                      }

                      return (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            background: color,
                          }}
                        >
                          {cell.render('Cell')}
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
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;

  padding: 0.25rem 0;
`;

const Table = styled.table`
  margin: 0 auto;

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

export default DraftSummaryTable;
