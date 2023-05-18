import React, { useState } from 'react';
import styled from 'styled-components';

import { categoryDetails } from '../utils/categoryUtils';
import TeamTotalsTable from '../tables/TeamTotalsTable';

function TeamTotalsContainer(props) {
  const [period, setPeriod] = useState('Season');

  const players = props.players;
  const teams = props.teams;
  const catIds = props.settings[0].categoryIds;

  const data = teams.map((team) => {
    const teamPlayers = players.filter((p) => p.onTeamId === team.teamId);

    const ratingsKey = `statRatings${period}`;

    const teamCats = {};
    catIds.forEach((id) => {
      const catName = categoryDetails.filter((cat) => cat.espnId === id)[0]
        .name;
      const totalRating = teamPlayers.reduce((a, b) => {
        const idRating = b?.[ratingsKey]?.[id] || 0;

        return a + idRating;
      }, 0);
      const avgRating = totalRating/teamPlayers.length;
      console.log(avgRating, teamPlayers.length)

      teamCats[catName] = avgRating;
    });
    const all = Object.values(teamCats).reduce((a, b) => a + b);

    return {
      ...team,
      ...teamCats,
      all: all,
    };
  });

  //console.log(data);

  return (
    <Container>
      <TeamTotalsTable data={data} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default TeamTotalsContainer;
