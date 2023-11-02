import React, { useState } from 'react';
import styled from 'styled-components';

import TooltipHeader from '../components/TooltipHeader';
import { categoryDetails } from '../utils/categoryUtils';
import TeamRankingsTable from '../tables/TeamRankingsTable';
import { LINEUP_SLOT_IDS } from '../utils/consts';

function TeamRankingsContainer(props) {
  const [period, setPeriod] = useState('Last15');

  const players = props.leagueData.players;
  const teams = props.leagueData.teams;
  const catIds = props.leagueData.settings[0].categoryIds;
  const rosters = props.leagueData.rosters;

  const periodArray = ['Last7', 'Last15', 'Last30', 'Season'];
  const ratingsKey = `statRatings${period}`;

  const catsList = categoryDetails.filter((cat) => catIds.includes(cat.espnId));

  const injuredIds = rosters.flatMap((r) => {
    if (r.lineupSlotId === LINEUP_SLOT_IDS.IR) {
      return r.playerId;
    }
    return [];
  });

  const data = teams.map((team) => {
    const teamRoster = rosters.filter(
      (r) => r.teamId === team.teamId && !injuredIds.includes(r.playerId)
    );
    const teamPlayers = teamRoster.map(r => {
      return players.filter(p => p.playerId === r.playerId)[0]
    });

    const teamCats = {};
    catsList.forEach((cat) => {
      const catId = cat.espnId;
      const catName = cat.name;

      const totalRating = teamPlayers.reduce((a, b) => {
        const idRating = b?.[ratingsKey]?.[catId] || 0;

        return a + idRating;
      }, 0);
      const avgRating = totalRating / teamPlayers.length;

      teamCats[catName] = avgRating;
    });
    const all = Object.values(teamCats).reduce((a, b) => a + b);

    return {
      ...team,
      ...teamCats,
      all: all,
    };
  });
  catsList.push(categoryDetails.filter((cat) => cat.name === 'all')[0]);

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const teamRankingsInfo = `This table shows the average ratings of
  each team for each category and totals for each. Ratings are available
  for different time ranges with 'Last 15' as default. Players in IR 
  slots are excluded from the ratings.`;

  return (
    <Container>
      <TooltipHeader title='Team Power Rankings' info={teamRankingsInfo} />
      <DropDown value={period} onChange={handlePeriodChange}>
        {periodArray.map((o) => {
          return (
            <option value={o} key={o}>
              {o.replace(/[^0-9](?=[0-9])/g, '$& ')}
            </option>
          );
        })}
      </DropDown>
      <TeamRankingsTable data={data} cats={catsList} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
`;

const DropDown = styled.select`
  margin: 0.25rem auto;
`;

export default TeamRankingsContainer;
