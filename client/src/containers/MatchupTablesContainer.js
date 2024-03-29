import React, { useState } from 'react';
import styled from 'styled-components';

import MatchupTable from '../tables/MatchupTable';
import { categoryDetails } from '../utils/categoryUtils';
import {
  getCatWinProbability,
  getMatchupWinProbability,
} from '../utils/probabilityMath';

function MatchupTablesContainer(props) {
  const data = props.data;
  const teams = props.teams;
  const settings = props.settings[0].categoryIds;
  const currentWeek = parseInt(props.currentWeek);

  const cats = categoryDetails.filter((o) => {
    return settings.includes(o.espnId) && o.name !== 'mins';
  });

  // Joining team names to data
  const scoreboardData = data.map((row) => {
    const team = teams.filter((team) => team.teamId === row.teamId);

    return {
      ...row,
      fullTeamName: team[0].fullTeamName,
      firstName: team[0].firstName,
    };
  });

  const [week, setWeek] = useState(currentWeek);
  const [teamId, setTeamId] = useState('');
  const [displayList, setDisplayList] = useState(
    scoreboardData.filter((row) => row.week === week)
  );

  const statisticData = displayList.map((row) => {
    const week = row.week;
    const teamId = row.teamId;
    const awayTeamId = row.awayId;
    const homeScoreboardData = scoreboardData.filter(
      (d) => d.teamId === teamId && d.week < week
    );
    const awayScoreboardData = scoreboardData.filter(
      (d) => d.teamId === awayTeamId && d.week < week
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
    const matchupWinProb = (getMatchupWinProbability(minCats, catProbs) * 100)
      .toFixed(0)
      .toString(10);

    return {
      week: week,
      teamId: teamId,
      awayId: awayTeamId,
      fullTeamName: 'Initial Win %',
      firstName: matchupWinProb,
      type: 'prob',
      ...statistics,
    };
  });

  // Adjustment for changing contexts
  if (week > currentWeek + 1) {
    setWeek(currentWeek);
    setTeamId('');
    setDisplayList(scoreboardData.filter((row) => row.week === currentWeek));
  }

  const weekArray = Array.from(new Array(currentWeek + 1), (x, i) => i + 1);

  const handleWeekChange = (e) => {
    const val = parseInt(e.target.value);
    setWeek(val);
    setTeamId('');

    setDisplayList(scoreboardData.filter((row) => row.week === val));
  };

  const handleTeamIdChange = (e) => {
    const val = parseInt(e.target.value);
    setTeamId(val);
    setWeek('');

    setDisplayList(scoreboardData.filter((row) => row.teamId === val));
  };

  return (
    <Container>
      <DropDownList>
        <DropDown value={week} onChange={handleWeekChange}>
          <option value='' key={0}>
            Select Week
          </option>
          {weekArray.map((o) => {
            return (
              <option value={o} key={o}>
                Week {o}
              </option>
            );
          })}
        </DropDown>
        <DropDown value={teamId} onChange={handleTeamIdChange}>
          <option value='' key={0}>
            Select Team
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
      <TablesList>
        {displayList.map((displayRow) => {
          return (
            <MatchupTable
              key={displayRow.week + displayRow.teamId}
              cats={cats}
              home={displayRow}
              away={scoreboardData.filter(
                (row) =>
                  row.week === displayRow.week &&
                  row.teamId !== displayRow.teamId
              )}
              stats={statisticData.filter(
                (row) =>
                  row.week === displayRow.week &&
                  row.teamId === displayRow.teamId
              )}
            />
          );
        })}
      </TablesList>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const DropDownList = styled.div`
  display: flex;
  flex-direction: row;

  margin: 0.2rem auto;
`;

const TablesList = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;

  max-width: 100%;
  padding: 1rem 0;
`;

const DropDown = styled.select`
  margin: 0 0.1rem;
`;

export default MatchupTablesContainer;
