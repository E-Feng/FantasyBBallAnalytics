import React from 'react';
import { useTable, useSortBy } from 'react-table';
import styled from 'styled-components';

import { categoryDetails } from '../utils/categoryUtils';
import { getHSLColor } from '../utils/colorsUtil';

function TeamRankingsTable(props) {
  const data = props.data;
  const cats = props.cats;

  data.sort((a, b) => b.all - a.all);

  const catNamesArray = cats.map(cat => cat.name);
  
  // Calculating ranges for color
  const catColorRange = {};
  catNamesArray.forEach((catName) => {
    const dataset = data.map((row) => row[catName]);

    catColorRange[catName] = [Math.min(...dataset), Math.max(...dataset)];
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

        Cell: (props) => <p>{props.value.substring(0, 20)}</p>,
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
        sortType: 'basic',

        Cell: (props) => {
          const val = props.value;
          const range = catColorRange[props.column.id];
          const color = getHSLColor(val, range[0], range[1]);
          return <p style={{ background: color }}>{val.toFixed(2)}</p>;
        },
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

export default TeamRankingsTable;
