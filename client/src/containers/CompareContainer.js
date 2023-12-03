import React, { useState } from 'react';
import styled from 'styled-components';

import CompareTable from '../tables/CompareTable';
import CompareSummaryTable from '../tables/CompareSummaryTable';
import * as arrayMath from '../utils/arrayMath';
import * as catUtils from '../utils/categoryUtils';
import { calculateMatchup } from '../utils/matchupUtils';
import CompareH2HTable from '../tables/CompareH2HTable';
import CompareWinProbTable from '../tables/CompareWinProbTable';
import {
  getCatWinProbability,
  getMatchupWinProbability,
} from '../utils/probabilityMath';

function CompareContainer(props) {
  const [selectedTeams, setSelectedTeams] = useState([0, 0]);

  const teams = props.teams;
  const scoreboardData = props.data;
  const catSettings = props.settings[0].categoryIds;
  const currentWeek = props.currentWeek;

  const data = [];
  const h2hData = [];
  const summaryData = {};
  const statData = [];

  // Filtering out unselected teams
  const filteredData = scoreboardData.filter((row) =>
    selectedTeams.includes(row.teamId)
  );

  // Filtering out the categories
  const cats = catUtils.categoryDetails.filter(o => {
    return catSettings.includes(o.espnId) && o.name !== 'mins'
  })

  // Aggregate and compute win probabilities
  if (!selectedTeams.includes(0)) {
    for (const team of selectedTeams) {
      const compTeamId = team;
      const compAwayTeamId = selectedTeams.filter(o => o != team)?.[0];
      const statRow = {};
      statRow["rowHeader"] = teams.filter((team) => team.teamId === compTeamId)?.[0]?.fullTeamName;
      for (let week = 1; week <= currentWeek; week++) {
        // TODO update for each loop, instead of recomputing
        let matchupWinProb;
        if (team === selectedTeams[0]) {
          const homeScoreboardData = filteredData.filter(
            (d) => d.teamId === compTeamId && d.week < week
          );
          const awayScoreboardData = filteredData.filter(
            (d) => d.teamId === compAwayTeamId && d.week < week
          );
          const statistics = {};
          cats.forEach((cat) => {
            const catHomeData = homeScoreboardData.map((d) => d[cat.name]);
            const catAwayData = awayScoreboardData.map((d) => d[cat.name]);
            const winProb = getCatWinProbability(
              catHomeData,
              catAwayData,
              cat.inverse
            );

            statistics[cat.name] = winProb * 100;
          });

          const numCats = cats.length;
          let minCats = Math.ceil(numCats / 2);

          if (numCats % 2 === 0) {
            if (statistics['pts'] < 50) {
              minCats = minCats + 1;
            }
          }

          const catProbs = Object.values(statistics);
          matchupWinProb = (getMatchupWinProbability(minCats, catProbs) * 100)
            .toFixed(0)
            .toString(10);
        } else {
          matchupWinProb = 100 - statData[0][`week${week}`];
        }
        statRow[`week${week}`] = matchupWinProb;
        // statRow[`week${week}CatProbs`] = statistics;
      };
      statData.push(statRow);
      console.log(statData);
    };
  };
  // Aggregate and compute relevant H2H Data
  if (!selectedTeams.includes(0)) {
    for (const teamId of selectedTeams) {
      const h2hRow = {}
      h2hRow["rowHeader"] = teams.filter((team) => team.teamId === teamId)?.[0]?.fullTeamName;
      for (let week = 1; week <= currentWeek; week++) {
        if (teamId === selectedTeams[0]) {
          const weekData = filteredData.filter((o) => o.week === week && o.teamId === teamId)?.[0];
          const oppWeekData = filteredData.filter((o) => o.week === week && o.teamId === selectedTeams[1])?.[0];
          h2hRow[`week${week}`] = calculateMatchup(weekData, oppWeekData) ? 'Won' : '';
        } else {
          h2hRow[`week${week}`] = (h2hData[0][`week${week}`] === 'Won') ? '' : 'Won';
        }
      }
      h2hData.push(h2hRow);
    }
  }

  // Calculating comparison table and summary table
  if (!selectedTeams.includes(0)) {
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
          if (row.teamId === team && row.week <= currentWeek) {
            const dataPoint = row[catName];

            // Setting individual team data
            dataRow['week' + row.week] = dataPoint?.toFixed(digits);

            // Setting summary data
            allCatValues.push(dataPoint);
          }
        });
        const dataRowValues = Object.values(dataRow).splice(1);
        const mean = arrayMath.mean(dataRowValues)?.toFixed(digits);
        const stdev = arrayMath.stdev(dataRowValues)?.toFixed(digits);
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

  const isDataLoaded = data.length !== 0 && !selectedTeams.includes(0);

  // Function to handle changing drop down list
  const handleTeamChange = (e) => {
    const position = parseInt(e.target.firstChild.text.slice(-1)) - 1;
    const val = e.target.value;

    const newSelectedTeams = [selectedTeams[0], selectedTeams[1]];
    newSelectedTeams[position] = parseInt(val);

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
          <TopTableContainer>
            <CompareH2HTable
                data={h2hData}
                currentWeek={currentWeek}
              />
            <CompareWinProbTable
                data={statData}
                currentWeek={currentWeek}
              />
          </TopTableContainer>
          <BottomTableContainer>
            <CompareTable
                data={data}
                summaryData={summaryData}
                currentWeek={currentWeek}
              />
            <CompareSummaryTable data={data} currentWeek={currentWeek} />
          </BottomTableContainer>
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
  display: table;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

const TopTableContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

const BottomTableContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

export default CompareContainer;
