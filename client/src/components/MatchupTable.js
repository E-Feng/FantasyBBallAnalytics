import React from 'react';
import { useTable } from 'react-table';
import { calculateMatchup } from '../utils/matchupUtils';

import styled from 'styled-components';

function MatchupTable(props) {
  const teamKey = props.teamKey;

  const columns = React.useMemo(
    () => [
      {
        Header: 'Team',
        accessor: 'fullTeamName',

        Cell: (props) => (
          <React.Fragment>{props.value.substring(0, 20)}</React.Fragment>
        ),
      },
      {
        Header: 'Name',
        accessor: 'firstName',

        Cell: (props) => (
          <React.Fragment> {props.value.substring(0, 8)} </React.Fragment>
        ),
      },
      {
        Header: 'FG%',
        accessor: 'fgPer',

        Cell: (props) => (
          <React.Fragment> {props.value.toFixed(4)} </React.Fragment>
        ),
      },
      {
        Header: 'FT%',
        accessor: 'ftPer',

        Cell: (props) => (
          <React.Fragment> {props.value.toFixed(4)} </React.Fragment>
        ),
      },
      {
        Header: '3PM',
        accessor: 'threes',
      },
      {
        Header: 'REB',
        accessor: 'rebs',
      },
      {
        Header: 'AST',
        accessor: 'asts',
      },
      {
        Header: 'STL',
        accessor: 'stls',
      },
      {
        Header: 'BLK',
        accessor: 'blks',
      },
      {
        Header: 'TO',
        accessor: 'tos',
      },
      {
        Header: 'EJ',
        accessor: 'ejs',
      },
      {
        Header: 'PTS',
        accessor: 'pts',
      },
    ],
    []
  );

  const data = [].concat([props.home], props.away);

  // Adding full team name and first name to data from key
  data.forEach((row) => {
    row.firstName = teamKey[row.teamId].firstName;
    row.fullTeamName = teamKey[row.teamId].fullTeamName;
  });

  const tableInstance = useTable({ columns, data });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <Container>
      <Title>
        {teamKey[props.home.teamId].fullTeamName} - Week {props.home.week}
      </Title>
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
                // Conditional borders for matching matchup
                const isMatchup = props.home.awayId === row.original.teamId;

                // Determining who won the matchup to color team green/red
                const isWon = calculateMatchup(props.home, row.values);

                // Prepare the row for display
                prepareRow(row);
                return (
                  // Apply the row props
                  <tr
                    {...row.getRowProps()}
                    style={{
                      border: isMatchup ? '3px dashed blue' : '1px solid white',
                    }}
                  >
                    {
                      // Loop over the rows cells
                      row.cells.map((cell) => {
                        // Conditional background color rendering
                        const catId = cell.column.id;
                        const isFirstRow = cell.row.index === 0;
                        const isTeamId = cell.column.id === 'fullTeamName';
                        const isName = cell.column.id === 'firstName';
                        const isTied = props.home[catId] === cell.value;
                        let isGreater = props.home[catId] > cell.value;

                        if (
                          cell.column.id === 'tos' ||
                          cell.column.id === 'ejs'
                        ) {
                          isGreater = !isGreater;
                        }

                        return (
                          <td
                            {...cell.getCellProps()}
                            style={{
                              background:
                                isFirstRow || isName
                                  ? 'gainsboro'
                                  : isTeamId
                                  ? isWon
                                    ? 'limegreen'
                                    : 'salmon'
                                  : isTied
                                  ? 'yellow'
                                  : isGreater
                                  ? 'limegreen'
                                  : 'salmon',
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
      </TableContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;

  max-width: 100%;
  padding: 0.25rem 0;
`;

const Title = styled.h3`
  text-align: center;
  font-weight: normal;
`;

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;

  max-width: 100%;
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

export default MatchupTable;
