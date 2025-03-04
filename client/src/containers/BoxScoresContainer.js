import React, { useState } from 'react';
import styled from 'styled-components';

import {
  categoryDetails,
  calculatePercentageCats,
} from '../utils/categoryUtils';
import BoxScoreTable from '../tables/BoxScoreTable';
import { SCHEDULE_DATES, PRO_TEAM_IDS } from '../utils/consts';
import { getStdRange } from '../utils/arrayMath';

function BoxScoresContainer(props) {
  const getCheckedGames = (teamId, week) => {
    const boxScore = fullScoreboard.find(
      (row) => row.week === week && row.teamId === teamId
    );
    const newCheckedGames = {};
    players
      .filter((p) => [boxScore.teamId, boxScore.awayId].includes(p.teamId))
      .forEach((p) => (newCheckedGames[p.playerId] = p.gameStatus));

    return newCheckedGames;
  };

  const { teams, players, rosters, platform, scoreboard, settings } =
    props.data;
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
  const weekArray = [currentWeek, currentWeek + 1];

  // Init states
  const [week, setWeek] = useState(currentWeek);
  const [teamId, setTeamId] = useState(teams[0].teamId);

  const todayDate = new Date()
    .toLocaleString('en-CA', { timeZone: 'America/New_York' })
    .split(',')[0];

  const matchupPeriods = settings[0].matchupPeriods
    ? settings[0].matchupPeriods[week]
    : [week];
  let startDate;
  let endDate;

  matchupPeriods.forEach((period) => {
    const scheduleDates = SCHEDULE_DATES[platform][period];

    startDate = startDate ? startDate : scheduleDates[0];
    endDate = endDate ? endDate : scheduleDates[1];

    startDate = scheduleDates[0] < startDate ? scheduleDates[0] : startDate;
    endDate = scheduleDates[1] > endDate ? scheduleDates[1] : endDate;
  });

  schedule.forEach((g) => {
    g.teamIds = g.teams.map((t) => PRO_TEAM_IDS[t]);
  });

  players.forEach((p) => {
    p.type = 'player';

    const isInjured = p.injuryStatus === 'OUT';
    p.name = isInjured ? `${p.playerName}🚑` : p.playerName;

    const roster = rosters.find((r) => r.playerId === p.playerId);
    const teamId = roster ? roster.teamId : 0;
    p.teamId = teamId;

    const datesPlayed = {};
    schedule
      .filter((g) => g.date >= startDate && g.date <= endDate)
      .forEach((g) => {
        datesPlayed[g.date] =
          datesPlayed[g.date] !== undefined ? datesPlayed[g.date] : null;

        const isPlaying = g.teamIds.includes(p.proTeamId);
        const isCompleted = g.date < todayDate;

        if (isPlaying && isCompleted) {
          datesPlayed[g.date] = isPlaying + isCompleted;
        } else if (isPlaying && isInjured) {
          datesPlayed[g.date] = 0;
        } else if (isPlaying) {
          datesPlayed[g.date] = 1;
        }
      });

    p.gameStatus = Object.values(datesPlayed);
  });

  // Checked game state
  const [checkedGames, setCheckedGames] = useState(
    getCheckedGames(teamId, week)
  );

  const weekBoxScores = fullScoreboard.filter((row) => row.week === week);

  const homeBoxScore = weekBoxScores.find((row) => row.teamId === teamId);
  const bothTeamIds = [homeBoxScore.teamId, homeBoxScore.awayId];

  const bothBoxScores = fullScoreboard.filter(
    (row) => bothTeamIds.includes(row.teamId) && row.week === week
  );

  const handleWeekChange = (event) => {
    const newWeek = parseInt(event.target.value);
    if (isNaN(newWeek)) return;

    setWeek(newWeek);

    const newCheckedGames = getCheckedGames(teamId, newWeek);

    setCheckedGames(newCheckedGames);
  };

  const handleTeamIdChange = (e) => {
    const newTeamId = parseInt(e.target.value);
    if (isNaN(newTeamId)) return;

    setTeamId(newTeamId);

    const newCheckedGames = getCheckedGames(newTeamId, week);

    setCheckedGames(newCheckedGames);
  };

  const handleGameChange = (event, playerId, i) => {
    const gameStatus = checkedGames[playerId];
    gameStatus[i] = gameStatus[i] === 1 ? 0 : 1;

    setCheckedGames({
      ...checkedGames,
      playerId: gameStatus,
    });
  };

  // Adding Att/Made to cats
  const catIds = [...settings[0].categoryIds];
  if (catIds.includes(categoryDetails.find((o) => o.name === 'fgPer').espnId)) {
    const fgAttCat = categoryDetails.find((o) => o.name === 'fgAtt');
    const fgMadeCat = categoryDetails.find((o) => o.name === 'fgMade');
    fgAttCat.isDisplayOnly = true;
    fgMadeCat.isDisplayOnly = true;
    catIds.push(fgAttCat.espnId);
    catIds.push(fgMadeCat.espnId);
  }
  if (catIds.includes(categoryDetails.find((o) => o.name === 'ftPer').espnId)) {
    const ftAttCat = categoryDetails.find((o) => o.name === 'ftAtt');
    const ftMadeCat = categoryDetails.find((o) => o.name === 'ftMade');
    ftAttCat.isDisplayOnly = true;
    ftMadeCat.isDisplayOnly = true;
    catIds.push(ftAttCat.espnId);
    catIds.push(ftMadeCat.espnId);
  }

  const cats = categoryDetails.filter((o) => catIds.includes(o.espnId));

  // Calculating games left and stats
  players.forEach((p) => {
    if (checkedGames[p.playerId]) {
      p.gamesLeft = checkedGames[p.playerId].filter((s) => s === 1).length;
    } else {
      p.gamesLeft = p.gameStatus.filter((s) => s === 1).length;
    }

    cats.forEach((cat) => {
      p[cat.name] =
        p.statsLast15 && p.gamesLeft > 0
          ? p.statsLast15[cat.espnId] * p.gamesLeft
          : null;
    });
  });
  calculatePercentageCats(players);

  const projScores = weekBoxScores.map((row) => {
    const teamPlayers = players.filter((p) => p.teamId === row.teamId);
    return teamPlayers.reduce(
      (acc, p) => {
        cats.forEach((cat) => {
          acc[cat.name] = (acc[cat.name] || 0) + p[cat.name];
        });
        return acc;
      },
      { ...row, name: `${row.name} [PROJ]`, type: 'proj' }
    );
  });
  calculatePercentageCats(projScores);

  const diff = [];
  const diffProj = [];
  weekBoxScores.forEach((row) => {
    const scoreCopy = structuredClone(row);
    const projCopy = structuredClone(
      projScores.find((p) => p.teamId === row.teamId)
    );

    scoreCopy.name = 'Diff';
    scoreCopy.type = 'diff';
    projCopy.name = 'Diff [PROJ]';
    projCopy.type = 'diffProj';

    const awayRow = weekBoxScores.find((r) => r.teamId === row.awayId);
    const awayProj = projScores.find((p) => p.teamId === row.awayId);

    cats.forEach((cat) => {
      if (row[cat.name] && awayRow[cat.name]) {
        scoreCopy[cat.name] = row[cat.name] - awayRow[cat.name];
      }
      if (projCopy[cat.name] && awayProj[cat.name]) {
        projCopy[cat.name] = projCopy[cat.name] - awayProj[cat.name];
      }
    });
    diff.push(scoreCopy);
    diffProj.push(projCopy);
  });

  // Calculating color ranges
  const colorRanges = {
    player: {},
    team: {},
    proj: {},
    diff: {},
    diffProj: {},
  };
  cats.forEach((cat) => {
    const playersData = players.map((p) => p[cat.name]);
    colorRanges.player[cat.name] = getStdRange(playersData, 1.5);

    const teamsData = weekBoxScores.map((t) => t[cat.name]);
    colorRanges.team[cat.name] = getStdRange(teamsData, 1.5);

    const projData = projScores.map((t) => t[cat.name]);
    colorRanges.proj[cat.name] = getStdRange(projData, 1.5);

    const diffData = diff.map((t) => t[cat.name]);
    const maxVal = Math.max(...diffData);
    colorRanges.diff[cat.name] = [-maxVal, maxVal];

    const diffProjData = diffProj.map((t) => t[cat.name]);
    const maxValProj = Math.max(...diffProjData);
    colorRanges.diffProj[cat.name] = [-maxValProj, maxValProj];
  });

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
        <BoxScoreTable
          cats={cats}
          colorRanges={colorRanges}
          home={homeBoxScore}
          away={bothBoxScores.find((row) => row.teamId === homeBoxScore.awayId)}
          homeProj={projScores.find(
            (row) => row.teamId === homeBoxScore.teamId
          )}
          awayProj={projScores.find(
            (row) => row.teamId === homeBoxScore.awayId
          )}
          diff={diff.find((row) => row.teamId === homeBoxScore.teamId)}
          diffProj={diffProj.find((row) => row.teamId === homeBoxScore.teamId)}
          homePlayers={players.filter((p) => p.teamId === homeBoxScore.teamId)}
          awayPlayers={players.filter((p) => p.teamId === homeBoxScore.awayId)}
          checkedGames={checkedGames}
          handleGameChange={handleGameChange}
        />
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
