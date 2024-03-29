import React from 'react';
import { useTable } from 'react-table';
import styled from 'styled-components';

import { getHSLColor } from '../utils/colorsUtil';

function DraftRecapTable(props) {
  const data = props.data;
  const ratingsColorRange = props.range;
  const scoringType = props.scoringType;

  data.sort((a, b) => a.pickNumber - b.pickNumber);

  const diffColorRange = [-100, 100];
  const digits = scoringType === 'H2H_POINTS' ? 0 : 2;

  const numTeams = data.filter((player) => player.round === 1).length;
  const numPicks = data.length / numTeams;

  let borderMod = numTeams;

  switch (props.sortMode) {
    case 'team':
      data.sort((a, b) => a.teamId - b.teamId);
      borderMod = numPicks;
      break;
    case 'ranking':
      data.sort((a, b) => {
        // Handle non-integer rankings
        if (!Number.isInteger(a.ranking)) return 1;
        if (!Number.isInteger(b.ranking)) return -1;
        return a.ranking - b.ranking;
      });
      break;
    case 'difference':
      data.sort((a, b) => b.difference - a.difference);
      break;
    default:
      break;
  }

  const columns = React.useMemo(
    () => [
      {
        Header: 'Pick',
        accessor: 'pickNumber',
      },
      {
        Header: 'Round',
        accessor: 'round',
      },
      {
        Header: 'Team',
        accessor: 'fullTeamName',

        Cell: (props) => (
          <React.Fragment>
            {props.value ? props.value.substring(0, 20) : ''}
          </React.Fragment>
        ),
      },
      {
        Header: 'Player',
        accessor: 'playerName',
      },
      {
        Header: 'Ranking',
        accessor: 'ranking',
      },
      {
        Header: 'Rating',
        accessor: 'rating',

        Cell: (props) => (
          <React.Fragment>
            {typeof props.value === 'number' ? props.value.toFixed(digits) : ''}
          </React.Fragment>
        ),
      },
      {
        Header: 'Difference',
        accessor: 'difference',
      },
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
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
              // Conditional borders separating the rounds
              const isEndOfRound = (row.index + 1) % borderMod === 0;

              // Prepare the row for display
              prepareRow(row);
              return (
                // Apply the row props
                <tr
                  {...row.getRowProps()}
                  style={{
                    borderBottom: isEndOfRound
                      ? '3px solid red'
                      : '1px solid white',
                  }}
                >
                  {
                    // Loop over the rows cells
                    row.cells.map((cell) => {
                      // Conditional background color rendering
                      const headerId = cell.column.id;

                      const val = cell.value;
                      let color = 'gainsboro';

                      if (val !== null && val !== undefined) {
                        if (headerId === 'difference') {
                          color = getHSLColor(
                            val,
                            diffColorRange[0],
                            diffColorRange[1]
                          );
                        } else if (headerId === 'rating') {
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

export default DraftRecapTable;
