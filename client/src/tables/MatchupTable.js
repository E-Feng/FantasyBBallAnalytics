import React from 'react';
import { useTable } from 'react-table';
import styled from 'styled-components';

import { isHomeTeamWinner } from '../utils/matchupUtils';
import { getCatInverse } from '../utils/categoryUtils';
import { getHSLColor } from '../utils/colorsUtil';

function MatchupTable(props) {
  const cats = props.cats;

  const filler = [{ type: 'filler' }];
  const data = [].concat([props.home], props.away, filler, props.stats);

  const numTeams = props.away.length + 1;

  const columns = React.useMemo(() => {
    const teamHeaders = [
      {
        Header: 'Team',
        accessor: 'fullTeamName',

        Cell: (props) => {
          const val = props.value;
          const isFirstRow = props.cell.row.index === 0;
          const isAwayTeam = props.row.index < numTeams && !isFirstRow;
          const isProbability = props.row.original.type === 'prob';

          const homeData = props.rows[0].original;
          const awayData = props.row.original;
          const prob = props.row.original.firstName;

          const isWinner = isHomeTeamWinner(homeData, awayData, cats);

          let color = 'black';
          color = isFirstRow ? 'gainsboro' : color;
          color = isAwayTeam ? (isWinner ? 'limegreen' : 'salmon') : color;
          color = isProbability ? (prob >= 50 ? 'limegreen' : 'salmon') : color;

          return (
            <div style={{ background: color }}>
              <p>{typeof val === 'string' ? val.substring(0, 20) : ''}</p>
            </div>
          );
        },
      },
      {
        Header: 'Name',
        accessor: 'firstName',

        Cell: (props) => {
          const val = props.value;
          const isAwayTeam = props.row.index < numTeams;
          const isProbability = props.row.original.type === 'prob';

          let color = 'black';
          color = isAwayTeam ? 'gainsboro' : color;
          color = isProbability ? getHSLColor(val, 0, 100) : color;

          return (
            <div style={{ background: color }}>
              <p>{typeof val === 'string' ? val.substring(0, 8) : ''}</p>
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

          const catId = props.cell.column.id;
          const isFirstRow = props.cell.row.index === 0;
          const isSeparator = props.row.original.type === 'filler';
          const firstRowVal = props.rows[0].original[catId];

          const inverse = getCatInverse(catId);
          const isTied = val === firstRowVal;
          const isWinner = inverse ? val > firstRowVal : val < firstRowVal;

          let color;
          color = isTied ? 'yellow' : isWinner ? 'limegreen' : 'salmon';
          color = isFirstRow ? 'gainsboro' : color;
          color = isSeparator ? 'black' : color;

          if (props.row.original.type === 'prob') {
            color = getHSLColor(val, 0, 100);
          }

          const digits = props.row.index < numTeams ? cat.digits : 0;

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
        {props.home.fullTeamName} - Week {props.home.week}
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
                const isSeparator = row.original.type === 'filler';

                let rowStyle;
                let cellStyle;

                if (isMatchup) {
                  rowStyle = {
                    background: 'gainsboro',
                    border: '3px dashed blue',
                  };
                }
                if (isSeparator) {
                  cellStyle = {
                    height: '20px',
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

export default MatchupTable;
