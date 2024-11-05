import React, { useState } from 'react';
import styled from 'styled-components';
import {
  categoryDetails,
  calculatePercentageCats,
} from '../utils/categoryUtils';

import BoxScoreTable from '../tables/BoxScoreTable';
import { PRO_TEAM_IDS } from '../utils/consts';
import { getStdRange } from '../utils/arrayMath';

function BoxScoresContainer(props) {
  const { teams, players, rosters, scoreboard, settings } = props.data;
  const { schedule } = props.commonData;

  // Init data transformations
  const currentWeek = settings[0].currentWeek;
  const fullScoreboard = scoreboard.map((row) => {
    const team = teams.find((t) => t.teamId === row.teamId);
    return {
      ...row,
      type: 'team',
      name: team.fullTeamName,
    };
  });
  const weekArray = Array.from(new Array(currentWeek + 1), (x, i) => i + 1);

  // States
  const [week, setWeek] = useState(currentWeek);
  // const [teamId, setTeamId] = useState('');
  const [displayList, setDisplayList] = useState(
    fullScoreboard.filter((row) => row.week === week)
  );

  // Adding Att/Made to cats
  const catIds = settings[0].categoryIds;
  if (catIds.includes(categoryDetails.find((o) => o.name === 'fgPer').espnId)) {
    catIds.push(categoryDetails.find((o) => o.name === 'fgAtt').espnId);
    catIds.push(categoryDetails.find((o) => o.name === 'fgMade').espnId);
  }
  if (catIds.includes(categoryDetails.find((o) => o.name === 'ftPer').espnId)) {
    catIds.push(categoryDetails.find((o) => o.name === 'ftAtt').espnId);
    catIds.push(categoryDetails.find((o) => o.name === 'ftMade').espnId);
  }

  const cats = categoryDetails.filter((o) => catIds.includes(o.espnId));

  const handleWeekChange = (event) => {
    setWeek(event.target.value);
  };

  // const handleTeamIdChange = (event) => {
  //   setTeamId(event.target.value);
  // };

  schedule.forEach((g) => {
    g.teamIds = g.teams.map((t) => PRO_TEAM_IDS[t]);
  });

  const todayDate = new Date().toISOString().split('T')[0];

  // Calculating games left, adding owner id
  players.forEach((p) => {
    p.name = p.playerName;
    p.type = 'player';

    p.gamesLeft = 0;
    const datesPlayed = {};
    schedule
      .filter((g) => g.week === week)
      .forEach((g) => {
        datesPlayed[g.date] = datesPlayed[g.date] || 0;

        const isPlaying = g.teamIds.includes(p.proTeamId);
        const isCompleted = g.date < todayDate;

        if (isPlaying) {
          datesPlayed[g.date] = isPlaying + isCompleted;
        }

        if (isPlaying && !isCompleted) {
          p.gamesLeft++;
        }
      });
    p.gamesStatus = Object.values(datesPlayed);

    const roster = rosters.find((r) => r.playerId === p.playerId);
    const teamId = roster ? roster.teamId : 0;
    p.teamId = teamId;

    cats.forEach((cat) => {
      p[cat.name] = p.statsLast15 ? p.statsLast15[cat.espnId] : null;
    });
  });

  console.log(players);
  console.log(cats);

  const projectedScores = displayList.map((row) => {
    const scoreCopy = structuredClone(row);
    const teamPlayers = players.filter((p) => p.teamId === row.teamId);
    console.log('play', teamPlayers);

    return teamPlayers.reduce(
      (acc, p) => {
        cats.forEach((cat) => {
          acc[cat.name] = (acc[cat.name] || 0) + p[cat.name] * p.gamesLeft;
        });
        return acc;
      },
      { ...scoreCopy, name: `${row.name} (Proj)`, type: 'proj' }
    );
  });
  calculatePercentageCats(projectedScores);

  console.log('sb', fullScoreboard);
  console.log('projected', projectedScores);
  console.log(displayList);

  // Calculating color ranges
  const colorRanges = { player: {}, team: {}, proj: {} };
  cats.forEach((cat) => {
    const playersData = players.map((p) => p[cat.name]);
    colorRanges.player[cat.name] = getStdRange(playersData, 1.5);

    const teamsData = displayList.map((t) => t[cat.name]);
    colorRanges.team[cat.name] = getStdRange(teamsData, 1.5);

    const projData = projectedScores.map((t) => t[cat.name]);
    colorRanges.proj[cat.name] = getStdRange(projData, 1.5);
  });

  console.log(colorRanges);

  return (
    <Container>
      <DropDownList>
        <DropDown value={week} onChange={handleWeekChange}>
          <option value='' key={0}>
            Select Week
          </option>
          {weekArray.map((o) => (
            <option value={o} key={o}>
              Week {o}
            </option>
          ))}
        </DropDown>
        {/* <DropDown value={teamId} onChange={handleTeamIdChange}>
          <option value='' key={0}>
            Select Team
          </option>
          {props.teams.map((o) => (
            <option value={o.teamId} key={o.teamId}>
              {o.fullTeamName}
            </option>
          ))}
        </DropDown> */}
      </DropDownList>
      <TablesList>
        {displayList.map((displayRow) => {
          return (
            <BoxScoreTable
              key={displayRow.week + displayRow.teamId}
              cats={cats}
              colorRanges={colorRanges}
              home={displayRow}
              away={displayList.find((row) => row.teamId === displayRow.awayId)}
              homeProjected={projectedScores.find(
                (p) => p.teamId === displayRow.teamId
              )}
              awayProjected={projectedScores.find(
                (p) => p.teamId === displayRow.awayId
              )}
              players={players.filter((p) => p.teamId === displayRow.teamId)}
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

export default BoxScoresContainer;
