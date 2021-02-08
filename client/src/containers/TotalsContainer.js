import React, { useState } from 'react';

import SliderRange from '../components/SliderRange';
import TotalsTable from '../components/TotalsTable';

import styled from 'styled-components';

function TotalsContainer(props) {
  /**
   * Calculates total category wins through a set range of weeks for each team,
   * done every week against every other team unless onlyMatchup is selected
   * which will only use the specified matchup for that week
   * @param {*} data
   * @param {*} weekRange
   * @param {*} onlyMatchup
   */
  const calculateTotalCats = (data, weekRange, onlyMatchup) => {
    const cats = {
      fgPer: true,
      ftPer: true,
      threes: true,
      asts: true,
      rebs: true,
      stls: true,
      blks: true,
      tos: false,
      ejs: false,
      pts: true,
    };

    // Initialize total category object
    const teams = props.teams;
    const totals = teams.map((team) => {
      for (let cat of Object.keys(cats)) {
        team[cat] = [0, 0, 0];
      }
      return team;
    });

    // Iterate through each week first
    for (let wk = weekRange[0]; wk <= weekRange[1]; wk++) {
      const weekData = data.filter((row) => row.week === wk);

      // Iterate through each team
      for (let stats of weekData) {
        // Getting index of team in totals array
        const index = totals.findIndex(o => o.teamId === stats.teamId);

        // Filter out only opposing matchup if selected
        let opposing = {};
        if (onlyMatchup) {
          opposing = weekData.filter((row) => row.teamId === stats.awayId);
        } else {
          opposing = weekData.filter((row) => row.teamId !== stats.teamId);
        }

        // Iterate through cats to calculate totals
        for (let cat of Object.keys(cats)) {
          const val = stats[cat];
          const opposingValues = opposing.map(o => o[cat]);

          let wins = opposingValues.reduce((a, b) => ((val > b) ? 1 : 0) + a, 0);
          let losses = opposingValues.reduce((a, b) => ((val < b) ? 1 : 0) + a, 0);
          const ties = Object.keys(cats).length - wins - losses;

          // Reverse wins and losses for TOs and EJs (negative stats)
          if (!cats[cat]) {
            [wins, losses] = [losses, wins];
          }

          totals[index][cat][0] += wins;
          totals[index][cat][1] += losses;
          totals[index][cat][2] += ties;
        }
      }
    }

    return totals;
  };

  const [weekRange, setWeekRange] = useState([1, props.currentWeek]);
  const [onlyChecked, setChecked] = useState(false);

  const handleCheckbox = (e) => {
    setChecked(!onlyChecked);
  };

  const aggData = calculateTotalCats(props.data, weekRange, onlyChecked);

  return (
    <Container>
      <Forms>
        <SliderRange
          weekRange={weekRange}
          setWeekRange={setWeekRange}
          max={props.currentWeek}
        ></SliderRange>
        <Checkbox>
          <input
            type='checkbox'
            checked={onlyChecked}
            onChange={handleCheckbox}
          />
          Only Matchups
        </Checkbox>
      </Forms>
      <TotalsTable data={aggData}></TotalsTable>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Forms = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;

  margin-bottom: 1rem;
`;

const Checkbox = styled.label`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  input {
    height: 16px;
    width: 16px;
    margin: 0 0.25rem;
  }
`;

export default TotalsContainer;
