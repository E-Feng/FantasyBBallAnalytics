import React from 'react';
import { useTable } from 'react-table';

import styled from 'styled-components';

function TotalsTable(props) {
  const showPercent = (props) => {
    const denom = props.value[0] + props.value[1];
    const percent = denom !== 0 ? (props.value[0] * 100) / denom : 100;
    return <React.Fragment>{percent.toFixed(0)}</React.Fragment>;
  };

  const getHSLColor = (percent, start, end) => {
    const a = percent / 100;
    const b = (end - start) * a;
    const c = b + start;

    // Return a CSS HSL string
    return `hsl(${c}, 100%, 50%)`;
  };

  const cats = [
    'fgPer',
    'ftPer',
    'threes',
    'rebs',
    'asts',
    'stls',
    'blks',
    'tos',
    'ejs',
    'pts',
  ];

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
        Header: 'Name',
        accessor: 'firstName',

        Cell: (props) => (
          <React.Fragment> {props.value.substring(0, 8)} </React.Fragment>
        ),
      },
      {
        Header: 'W',
        accessor: 'wins',
      },
      {
        Header: 'L',
        accessor: 'losses',
      },
      {
        Header: 'FG%',
        accessor: 'fgPer',

        Cell: showPercent,
      },
      {
        Header: 'FT%',
        accessor: 'ftPer',

        Cell: showPercent,
      },
      {
        Header: '3PM',
        accessor: 'threes',

        Cell: showPercent,
      },
      {
        Header: 'REB',
        accessor: 'rebs',

        Cell: showPercent,
      },
      {
        Header: 'AST',
        accessor: 'asts',

        Cell: showPercent,
      },
      {
        Header: 'STL',
        accessor: 'stls',

        Cell: showPercent,
      },
      {
        Header: 'BLK',
        accessor: 'blks',

        Cell: showPercent,
      },
      {
        Header: 'TO',
        accessor: 'tos',

        Cell: showPercent,
      },
      {
        Header: 'EJ',
        accessor: 'ejs',

        Cell: showPercent,
      },
      {
        Header: 'PTS',
        accessor: 'pts',

        Cell: showPercent,
      },
    ],
    []
  );

  const data = props.data;
  data.sort((a, b) => a.seed - b.seed);

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
                    const isCat = cats.includes(column.id);
                    return (
                      // Apply the header cell props
                      <th {...column.getHeaderProps()}
                      style={{
                        minWidth: isCat ? '25px' : '0px'
                      }}>
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
                      const val = cell.value;
                      let color = 'gainsboro';

                      if (Array.isArray(cell.value)) {
                        const denom = val[0] + val[1];
                        const percent =
                          denom !== 0 ? (val[0] * 100) / denom : 100;

                        color = getHSLColor(percent, 10, 110);
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
  flex-direction: row;
  justify-content: center;

  overflow: auto;
  padding: 0 0.5rem;
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

export default TotalsTable;
