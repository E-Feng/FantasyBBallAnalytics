import React, { useState } from 'react';
import styled from 'styled-components';

import TooltipHeader from '../components/TooltipHeader';
import { categoryDetails } from '../utils/categoryUtils';
import RosterTable from '../tables/RosterTable';

function RosterContainer(props) {
  const [period, setPeriod] = useState('Last15');
  const [displayList, setDisplayList] = useState([1]);

  const players = props.players;
  const teams = props.teams;
  const catIds = props.settings[0].categoryIds;

  const periodArray = ['Last7', 'Last15', 'Last30', 'Season'];
  const ratingsKey = `statRatings${period}`;

  const catsList = categoryDetails.filter((cat) => catIds.includes(cat.espnId));
  // catsList.push(categoryDetails.filter(cat => cat.name == 'mins')[0]);

  const rosteredPlayerIds = [];

  teams.forEach((team) => {
    team.roster.forEach((player) => {
      rosteredPlayerIds.push(player.playerId);
    });
  });

  const rosteredPlayers = players.filter((player) =>
    rosteredPlayerIds.includes(player.playerId)
  );

  const data = rosteredPlayers.map(player => {
    const catsData = {}
    catsList.forEach(cat => {
      catsData[cat.name] = player?.[ratingsKey]?.[cat.espnId] || null;
    })
    const all = Object.values(catsData).reduce((a, b) => a + b);

    return {
      ...team,
      playerName: player.playerName,
      ...catsData,
      all: all
    }
  })

  console.log(data)
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
      {/* <TablesList>
        {displayList.map((teamId) => {
          return <RosterTable key={teamId} data={data.filter()} />;
        })}
      </TablesList> */}
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
  padding: 1rem 0;
`;

export default RosterContainer;
