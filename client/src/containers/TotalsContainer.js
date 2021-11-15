import React, { useState } from 'react';
import styled from 'styled-components';

import SliderRange from '../components/SliderRange';
import TotalsTable from '../tables/TotalsTable';
import { categoryDetails } from '../utils/categoryUtils';


function TotalsContainer(props) {
  /**
   * Calculates total category wins through a set range of weeks for each team,
   * done every week against every other team unless onlyMatchup is selected
   * which will only use the specified matchup for that week
   * @param {*} data
   * @param {*} weekRange
   * @param {*} onlyMatchup
   */
  const settings = props.settings[0].categoryIds;
  const cats = categoryDetails.filter(o => {
    return settings.includes(o.espnId)
  })

  const calculateTotalCats = (data, weekRange, onlyMatchup) => {
    // Initialize total category object
    const teams = props.teams;
    const totals = teams.map((team) => {
      for (let cat of cats) {
        team[cat.name] = [0, 0, 0];
      }
      // For calculating all categories
      team['all'] = [0, 0, 0];

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
        let opposing;
        if (onlyMatchup) {
          opposing = weekData.filter((row) => row.teamId === stats.awayId);
        } else {
          opposing = weekData.filter((row) => row.teamId !== stats.teamId);
        }

        // Iterate through cats to calculate totals
        for (let cat of cats) {
          const val = stats[cat.name];
          const opposingValues = opposing.map(o => o[cat.name]);
          //console.log(opposingValues)

          let wins = opposingValues.reduce((a, b) => ((val > b) ? 1 : 0) + a, 0);
          let losses = opposingValues.reduce((a, b) => ((val < b) ? 1 : 0) + a, 0);
          const ties = opposingValues.length - wins - losses;

          // Reverse wins and losses for TOs and EJs (negative stats)
          if (cat.inverse) {
            [wins, losses] = [losses, wins];
          }

          totals[index][cat.name][0] += wins;
          totals[index][cat.name][1] += losses;
          totals[index][cat.name][2] += ties;

          // Calculating average of all categories
          totals[index]['all'][0] += wins;
          totals[index]['all'][1] += losses;
          totals[index]['all'][2] += ties;
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
      {props.currentWeek !== 1 ? (
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
      ) : (<br></br>)}
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
