import React from 'react';
import { useTable, useSortBy } from 'react-table';
import styled from 'styled-components';

import { getHSLColor } from '../utils/colorsUtil';

function RosterTable(props) {
  const data = props.data;
  const cats = props.cats;
  const catColorRange = props.catColorRange;

  data.sort((a, b) => {
    const aa = a.all || a.pts;
    const bb = b.all || b.pts;

    if (aa == null) return 1;
    if (bb == null) return -1;

    return bb - aa;
  });

  const columns = React.useMemo(() => {
    const teamHeaders = [
      {
        Header: 'Player',
        accessor: 'playerName',

        Cell: (props) => {
          return <p style={{ width: '140px' }}>{props.value}</p>;
        },
      },
      {
        Header: 'Ranking',
        accessor: 'ranking'
      }
    ];
    const catHeaders = cats.map((cat) => {
      return {
        Header: cat.display,
        accessor: cat.name,
        sortType: 'basic',

        Cell: (props) => {
          const val = props.value;
          const range = catColorRange[props.column.id];
          const color = getHSLColor(val, range[0], range[1]);
          return (
            <p style={{ background: color, minWidth: '30px' }}>
              {typeof val == 'number' ? parseFloat(val).toFixed(2) : ''}
            </p>
          );
        },
      };
    });

    return teamHeaders.concat(catHeaders);
    // eslint-disable-next-line
  }, [props.cats]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
      },
      useSortBy
    );

  return (
    <Container>
      <Title>{props.fullTeamName}</Title>
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
                    return (
                      // Apply the header cell props
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
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
                      return (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
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
  margin-bottom: 0.75rem;
`;

const Title = styled.h3`
  text-align: center;
  font-weight: normal;
`;

const Table = styled.table`
  margin: 0 auto;

  font-family: Arial;
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  color: black;

  background: gainsboro;

  border-collapse: collapse;
  border-spacing: 0;
  border: 1px solid white;

  th {
    padding: 0.25rem;
    background: silver;
    color: black;
  }

  td {
    padding: 0;
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
    border-bottom: 1px solid white;
    border-right: 1px solid white;

    :last-child {
      border-right: 0;
    }

    p {
      padding: 0.25rem 0.3rem;
    }
  }
`;

export default RosterTable;
