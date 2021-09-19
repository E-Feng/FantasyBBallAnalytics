import React, { useState } from 'react';
import styled from 'styled-components';

import CompareTable from '../tables/CompareTable';
import CompareSummaryTable from '../tables/CompareSummaryTable';
import * as arrayMath from '../utils/arrayMath';

function CompareContainer(props) {
  const [selectedTeams, setSelectedTeams] = useState(['', '']);

  const teams = props.teams;
  const scoreboardData = props.data;

  const data = [];

  // Filtering out unselected teams
  const filteredData = scoreboardData.filter((row) =>
    selectedTeams.includes(row.teamId.toString())
  );

  const cats = [
    { name: 'fgPer', display: 'FG%' },
    { name: 'ftPer', display: 'FT%' },
    { name: 'threes', display: '3PM' },
    { name: 'rebs', display: 'REB' },
    { name: 'asts', display: 'AST' },
    { name: 'stls', display: 'STL' },
    { name: 'blks', display: 'BLK' },
    { name: 'tos', display: 'TO' },
    { name: 'ejs', display: 'EJ' },
    { name: 'pts', display: 'PTS' },
  ];

  for (const cat of cats) {
    const name = cat.name;
    const display = cat.display;
    for (const team of selectedTeams) {
      const dataRow = {};
      dataRow['rowHeader'] = display;

      filteredData.forEach((row) => {
        if (row.teamId.toString() === team) {
          dataRow['week' + row.week] = Number.isInteger(row[name])
            ? row[name]
            : row[name].toFixed(4);
        }
      });

      data.push(dataRow);
    }
  }

  console.log(Object.values(data[0]));
  console.log(arrayMath.mean(Object.values(data[0])));

  console.log(data);

  const isDataLoaded = (data.length !== 0) & !selectedTeams.includes('');

  // Function to handle changing drop down list
  const handleTeamChange = (e) => {
    const position = parseInt(e.target.firstChild.text.slice(-1)) - 1;
    const val = e.target.value;

    const newSelectedTeams = [selectedTeams[0], selectedTeams[1]];
    newSelectedTeams[position] = val;

    if (newSelectedTeams[0] !== newSelectedTeams[1]) {
      setSelectedTeams(newSelectedTeams);
    }
  };

  return (
    <Container>
      <DropDownList>
        <DropDown value={selectedTeams[0]} onChange={handleTeamChange}>
          <option value='' key={0}>
            Select Team 1
          </option>
          {teams.map((o) => {
            return (
              <option value={o.teamId} key={o.teamId}>
                {o.fullTeamName}
              </option>
            );
          })}
        </DropDown>
        <DropDown value={selectedTeams[1]} onChange={handleTeamChange}>
          <option value='' key={0}>
            Select Team 2
          </option>
          {teams.map((o) => {
            return (
              <option value={o.teamId} key={o.teamId}>
                {o.fullTeamName}
              </option>
            );
          })}
        </DropDown>
      </DropDownList>
      {isDataLoaded ? (
        <TableContainer>
          <CompareTable data={data} currentWeek={props.currentWeek} />
          <CompareSummaryTable data={data} currentWeek={props.currentWeek} />
        </TableContainer>
      ) : (
        <br />
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
`;

const DropDownList = styled.div`
  display: flex;
  flex-direction: row;

  margin: 0.2rem auto;
  margin-bottom: 1rem;
`;

const DropDown = styled.select`
  width: 50%;
  margin: 0 0.1rem;
`;

const TableContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`

export default CompareContainer;
