import React from 'react';
import { useTable, useSortBy } from 'react-table';
import styled from 'styled-components';

import { categoryDetails } from '../utils/categoryUtils';
import { getHSLColor } from '../utils/colorsUtil';

function TotalsTable(props) {
  const getPercent = (values) => {
    const denom = values[0] + values[1];
    const percent = denom !== 0 ? (values[0] * 100) / denom : 100;
    return percent;
  };

  const showPercent = (cell) => {
    const values = cell.value;
    return <React.Fragment>{getPercent(values).toFixed(0)}</React.Fragment>;
  };

  const sortPercent = (rowA, rowB, id, desc) => {
    const percentA = getPercent(rowA.values[id]);
    const percentB = getPercent(rowB.values[id]);

    if (percentA > percentB) return -1;
    if (percentB > percentA) return 1;
    return 0;
  };

  const data = props.data;
  data.sort((a, b) => a.seed - b.seed);

  // Getting cats for the league
  const cats = categoryDetails.filter((cat) => {
    return Object.keys(data[0]).includes(cat.name);
  });

  const columns = React.useMemo(() => {
    const teamHeaders = [
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
    ];
    const catHeaders = cats.map((cat) => {
      return {
        Header: cat.display,
        accessor: cat.name,
        sortType: sortPercent,

        Cell: showPercent,
      };
    });

    return teamHeaders.concat(catHeaders);
    // eslint-disable-next-line
  }, [props]);

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
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        style={{
                          minWidth: isCat ? '25px' : '0px',
                        }}
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
                      const val = cell.value;
                      let color = 'gainsboro';

                      if (Array.isArray(cell.value)) {
                        const denom = val[0] + val[1];
                        color = getHSLColor(val[0], 0, denom);
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

export default TotalsTable;
