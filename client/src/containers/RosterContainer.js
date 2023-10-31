import React, { useState } from 'react';
import styled from 'styled-components';

import TooltipHeader from '../components/TooltipHeader';
import { categoryDetails } from '../utils/categoryUtils';
import RosterTable from '../tables/RosterTable';

function RosterContainer(props) {
  const [period, setPeriod] = useState('Last15');
  const [displayList, setDisplayList] = useState([1, 4]);

  const players = props.leagueData.players;
  const teams = props.leagueData.teams;
  const rosters = props.leagueData.rosters;
  const catIds = props.leagueData.settings[0].categoryIds;

  const periodArray = ['Last7', 'Last15', 'Last30', 'Season'];
  const ratingsKey = `statRatings${period}`;

  const catsList = categoryDetails.filter((cat) => catIds.includes(cat.espnId));
  // catsList.push(categoryDetails.filter(cat => cat.name == 'mins')[0]);
  console.log(teams);
  const data = rosters.map((r) => {
    // const team = teams.filter(team => team.teamId == r.teamId)[0];
    const player = players.filter((player) => player.playerId == r.playerId)[0];

    const catsData = {};
    catsList.forEach((cat) => {
      catsData[cat.name] = player?.[ratingsKey]?.[cat.espnId] || null;
    });
    const all = Object.values(catsData).includes(null)
      ? null
      : Object.values(catsData).reduce((a, b) => a + b);

    return {
      teamId: r.teamId,
      playerName: player.playerName,
      ...catsData,
      all: all,
    };
  });

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const rosterInfo = ``;

  return (
    <Container>
      <TooltipHeader title='Rosters' info={rosterInfo} />
      <DropDown value={period} onChange={handlePeriodChange}>
        {periodArray.map((o) => {
          return (
            <option value={o} key={o}>
              {o.replace(/[^0-9](?=[0-9])/g, '$& ')}
            </option>
          );
        })}
      </DropDown>
      <TablesList>
        {displayList.map((teamId) => {
          return (
            <RosterTable
              key={teamId}
              fullTeamName={
                teams.filter((t) => t.teamId == teamId)[0].fullTeamName
              }
              data={data.filter((p) => p.teamId == teamId)}
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
  padding: 0.5rem 0;
`;

const DropDown = styled.select`
  margin: 0.25rem auto;
`;

const TablesList = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;

  max-width: 100%;
  padding: 0.25rem 0;
`;

export default RosterContainer;
