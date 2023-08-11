import React from 'react';
import { useTable, useSortBy } from 'react-table';
import styled from 'styled-components';

import { categoryDetails } from '../utils/categoryUtils';
import { getHSLColor } from '../utils/colorsUtil';

function TeamRankingsTable(props) {
  const data = props.data;
  data.sort((a, b) => b.all - a.all);

  // Getting cats for the league
  const catArray = categoryDetails.filter((cat) => {
    return Object.keys(data[0]).includes(cat.name);
  });
  const catNamesArray = catArray.map((cat) => cat.name);

  // Calculating ranges for color
  const catColorRange = {}
  catNamesArray.forEach(catName => {
    const dataset = data.map(row => row[catName])

    catColorRange[catName] = [Math.min(...dataset), Math.max(...dataset)]
  })

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
    const catHeaders = catArray.map((cat) => {
      return {
        Header: cat.display,
        accessor: cat.name,
        sortType: 'basic',

        Cell: (props) => props.value.toFixed(2),
      };
    });

    return teamHeaders.concat(catHeaders);
    // eslint-disable-next-line
  }, []);

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
                      // Conditional background color rendering
                      const val = cell.value;
                      const catName = cell.column.id;

                      const range = catColorRange[catName];

                      let color = 'gainsboro';

                      if (catNamesArray.includes(catName)) {
                        color = getHSLColor(val, range[0], range[1]);
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

export default TeamRankingsTable;
