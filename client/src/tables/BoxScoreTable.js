import React from 'react';
import { useTable } from 'react-table';
import styled from 'styled-components';

import { calculateMatchup } from '../utils/matchupUtils';
import { getHSLColor } from '../utils/colorsUtil';

function BoxScoreTable(props) {
  const {
    cats,
    colorRanges,
    home,
    away,
    diff,
    homeProj,
    awayProj,
    diffProj,
    homePlayers,
    awayPlayers,
    checkedGames,
    handleGameChange,
  } = props;

  const filler = [{ type: 'filler' }];

  const data = [].concat(
    home,
    away,
    filler,
    homeProj,
    awayProj,
    filler,
    diff,
    diffProj,
    filler,
    homePlayers,
    filler,
    awayPlayers
  );

  const columns = React.useMemo(() => {
    const teamHeaders = [
      {
        Header: 'Team/Player',
        accessor: 'name',

        Cell: (props) => {
          const val = props.value;
          const type = props.row.original.type;

          const isSeparator = type === 'filler';
          const isPlayer = type === 'player';
          const isTeam = !isSeparator && !isPlayer;
          const isHome = props.row.original.teamId === home.teamId;

          let isWinner;
          if (isHome) {
            if (type === 'team' || type === 'diff') {
              isWinner = calculateMatchup(home, away, cats);
              console.log(home, away, cats)
              console.log(isWinner)
            } else if (type === 'proj' || type === 'diffProj') {
              isWinner = calculateMatchup(homeProj, awayProj, cats);
            }
          } else {
            if (type === 'team') {
              isWinner = calculateMatchup(away, home, cats);
            } else if (type === 'proj') {
              isWinner = calculateMatchup(awayProj, homeProj, cats);
            }
          }

          let color = 'gainsboro';
          color = isTeam ? (isWinner ? 'limegreen' : 'salmon') : color;
          color = isSeparator ? 'black' : color;

          return (
            <div style={{ background: color }}>
              <p>{typeof val === 'string' ? val.substring(0, 20) : ''}</p>
            </div>
          );
        },
      },
      {
        Header: 'Games',
        accessor: 'gamesStatus',

        Cell: (props) => {
          const playerId = props.row.original.playerId;
          const val = checkedGames[playerId] || [];

          const isSeparator = props.row.original.type === 'filler';

          let color = 'gainsboro';
          color = isSeparator ? 'black' : color;

          return (
            <div style={{ background: color, padding: '2px' }}>
              {val.map((v, i) => {
                return (
                  <input
                    key={i}
                    type='checkbox'
                    checked={v > 0}
                    disabled={v === 2}
                    onChange={(e) => handleGameChange(e, playerId, i)}
                    style={{
                      visibility: v !== null ? 'visible' : 'hidden',
                      height: '13px',
                      width: '13px',
                      marginLeft: '1px',
                    }}
                  />
                );
              })}
            </div>
          );
        },
      },
    ];
    const catHeaders = cats.map((cat) => {
      return {
        Header: cat.display,
        accessor: cat.name,

        Cell: (props) => {
          const val = props.value;
          const type = props.row.original.type;

          const isPlayer = type === 'player';
          const isSeparator = type === 'filler';

          let color = 'gainsboro';

          if (!isSeparator && val !== null) {
            const range = colorRanges[type][cat.name];
            color = getHSLColor(val, range[0], range[1], cat.inverse);
          }

          color = cat.colorless ? 'gainsboro' : color;
          color = isSeparator ? 'black' : color;

          const digits = isPlayer ? Math.max(1, cat.digits) : cat.digits;

          return (
            <div style={{ background: color }}>
              <p>{typeof val == 'number' ? val.toFixed(digits) : ''}</p>
            </div>
          );
        },
      };
    });

    return teamHeaders.concat(catHeaders);
    // eslint-disable-next-line
  }, [props]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <Container>
      <Title>
        {props.home.name} - Week {props.home.week}
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
                const isSeparator = row.original.type === 'filler';

                let rowStyle;
                let cellStyle;

                rowStyle = {
                  background: 'gainsboro',
                };

                if (isSeparator) {
                  cellStyle = {
                    height: '20px',
                    background: 'black',
                    borderLeft: '0',
                    borderRight: '0',
                  };
                }

                // Prepare the row for display
                prepareRow(row);
                return (
                  // Apply the row props
                  <tr {...row.getRowProps()} style={rowStyle}>
                    {
                      // Loop over the rows cells
                      row.cells.map((cell) => {
                        return (
                          <td {...cell.getCellProps()} style={cellStyle}>
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
  margin: 0.25rem 0;
`;

const Title = styled.h3`
  text-align: center;
  font-weight: normal;
`;

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;

  max-width: 100%;
  padding: 0;
  margin: 0;
  overflow: auto;
`;

const Table = styled.table`
  font-family: Arial;
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  color: black;
  background: black;

  width: 100%;
  padding: 0;
  border-collapse: collapse;
  border-spacing: 0;
  border: 1px solid white;

  th {
    background: silver;
    color: black;
    padding: 0.25rem;

    :last-child {
      border-right: 0;
    }
  }

  tr {
    :last-child {
      padding: 0;
      border-bottom: 0;
    }
  }

  th,
  td {
    margin: 0;
    border-bottom: 1px solid white;
    border-right: 1px solid white;

    :last-child {
      border-right: 0;
    }
  }

  td {
    padding: 0;
    margin: 0;

    div {
      padding: 0.25rem;

      p {
        max-height: 14px;
      }
    }
  }
`;

export default BoxScoreTable;
