import React, { useState } from 'react';
import styled from 'styled-components';

import CompareTable from '../tables/CompareTable';
import CompareSummaryTable from '../tables/CompareSummaryTable';
import * as arrayMath from '../utils/arrayMath';
import * as catUtils from '../utils/categoryUtils';

function CompareContainer(props) {
  const [selectedTeams, setSelectedTeams] = useState(['', '']);

  const teams = props.teams;
  const scoreboardData = props.data;
  const currentWeek = props.currentWeek;

  const data = [];
  const summaryData = {};

  // Filtering out unselected teams
  const filteredData = scoreboardData.filter((row) =>
    selectedTeams.includes(row.teamId.toString())
  );

  const cats = [
    { name: 'fgPer', display: 'FG%', digits: 4 },
    { name: 'ftPer', display: 'FT%', digits: 4 },
    { name: 'threes', display: '3PM' },
    { name: 'rebs', display: 'REB' },
    { name: 'asts', display: 'AST' },
    { name: 'stls', display: 'STL' },
    { name: 'blks', display: 'BLK' },
    { name: 'tos', display: 'TO' },
    { name: 'ejs', display: 'EJ' },
    { name: 'pts', display: 'PTS' },
  ];

  // Calculating comparison table and summary table
  if (!selectedTeams.includes('')) {
    for (const cat of cats) {
      const catName = cat.name;
      const display = cat.display;
      const digits = cat.digits ? cat.digits : 0;

      const allCatValues = [];
      for (const team of selectedTeams) {
        const dataRow = {};
        dataRow['rowHeader'] = display;
        dataRow['catId'] = catName;

        filteredData.forEach((row) => {
          if (row.teamId.toString() === team) {
            const dataPoint = row[catName];

            // Setting individual team data
            dataRow['week' + row.week] = dataPoint.toFixed(digits);

            // Setting summary data
            allCatValues.push(dataPoint);
          }
        });
        const dataRowValues = Object.values(dataRow);
        const mean = arrayMath.mean(dataRowValues).toFixed(digits);
        const stdev = arrayMath.stdev(dataRowValues).toFixed(digits);
        const min = Math.min(...arrayMath.filterNaN(dataRowValues));
        const max = Math.max(...arrayMath.filterNaN(dataRowValues));

        dataRow.mean = mean;
        dataRow.stdev = stdev;
        dataRow.min = min;
        dataRow.max = max;

        data.push(dataRow);
      }
      // Calculating summary cat data
      summaryData[display] = {
        mean: arrayMath.mean(allCatValues),
        stdev: arrayMath.stdev(allCatValues),
      };
    }
  }

  // Calculating the wins between teams for each category
  data.forEach(row => {
    row.wins = 0;
    const filteredCat = data.filter(o => o.rowHeader === row.rowHeader && o !== row)

    // Going through the weeks to add wins
    for (let week = 1; week <= currentWeek; week++) {
      const weekKey = 'week' + week

      const allCatValues = filteredCat.map(val => {
        return val[weekKey]
      })

      if (catUtils.determineWinner(row[weekKey], allCatValues, row.catId)) {
        row.wins = row.wins + 1;
      }
    }
  })

  const isDataLoaded = data.length !== 0 && !selectedTeams.includes('');

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
          <CompareTable
            data={data}
            summaryData={summaryData}
            currentWeek={currentWeek}
          />
          <CompareSummaryTable data={data} currentWeek={currentWeek} />
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
`;

export default CompareContainer;
