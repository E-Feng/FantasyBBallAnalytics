import React, { useState } from 'react';
import styled from 'styled-components';

import { categoryDetails } from '../utils/categoryUtils';
import TeamRankingsTable from '../tables/TeamRankingsTable';
import { LINEUP_SLOT_IDS } from '../utils/consts';

function TeamRankingsContainer(props) {
  const [period, setPeriod] = useState('Last15');

  const players = props.players;
  const teams = props.teams;
  const catIds = props.settings[0].categoryIds;

  const periodArray = ['Last7', 'Last15', 'Last30', 'Season'];
  const ratingsKey = `statRatings${period}`;

  const data = teams.map((team) => {
    const injuredIds = team.roster.flatMap((r) => {
      if (r.lineupSlotId === LINEUP_SLOT_IDS.IR) {
        return r.playerId;
      }
      return [];
    });

    const teamPlayerIds = team.roster.map(r => r.playerId)
    const teamPlayers = players.filter(
      (p) => teamPlayerIds.includes(p.playerId) && !injuredIds.includes(p.playerId)
    );

    const teamCats = {};
    catIds.forEach((id) => {
      const catName = categoryDetails.filter((cat) => cat.espnId === id)[0]
        .name;
      const totalRating = teamPlayers.reduce((a, b) => {
        const idRating = b?.[ratingsKey]?.[id] || 0;

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

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  return (
    <Container>
      <DropDown value={period} onChange={handlePeriodChange}>
        {periodArray.map((o) => {
          return (
            <option value={o} key={o}>
              {o.replace(/[^0-9](?=[0-9])/g, '$& ')}
            </option>
          );
        })}
      </DropDown>
      <TeamRankingsTable data={data} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const DropDown = styled.select`
  margin: 0.5rem auto;
`;

export default TeamRankingsContainer;
