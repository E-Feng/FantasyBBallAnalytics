import React, { useState } from 'react';
import styled from 'styled-components';

import TooltipHeader from '../components/TooltipHeader';
import MultiSelectCheckbox from '../components/MultiSelectCheckbox';
import { categoryDetails } from '../utils/categoryUtils';
import { getStdRange } from '../utils/arrayMath';
import RosterTable from '../tables/RosterTable';

function RosterContainer(props) {
  const teams = props.leagueData.teams;

  const [period, setPeriod] = useState('Season');
  const [statType, setStatType] = useState('statRatings');
  const [displayList, setDisplayList] = useState([teams[0].teamId]);

  const players = props.leagueData.players;
  const rosters = props.leagueData.rosters;
  const catIds = props.leagueData.settings[0].categoryIds;

  const periodArray = ['Last7', 'Last15', 'Last30', 'Season'];
  const statTypeArray = ['statRatings', 'stats'];
  const ratingsKey = `${statType}${period}`;

  const teamOptions = teams.map((team) => {
    return {
      value: team.teamId,
      label: team.fullTeamName,
    };
  });
  teamOptions.push({
    value: 0,
    label: 'All Rostered Players',
  });

  const catsList = categoryDetails.filter((cat) => catIds.includes(cat.espnId));
  // catsList.push(categoryDetails.filter(cat => cat.name == 'mins')[0]);

  const data = rosters.map((r) => {
    const player = players.filter(
      (player) => player.playerId === r.playerId
    )[0];
    // console.log(player)
    const catsData = {};
    catsList.forEach((cat) => {
      catsData[cat.name] = player?.[ratingsKey]?.[cat.espnId];
    });
    const all =
      Object.values(catsData).includes(undefined) || statType === 'stats'
        ? null
        : Object.values(catsData).reduce((a, b) => a + b);

    return {
      teamId: r.teamId,
      playerName: player.playerName,
      ranking: player[`totalRanking${period}`],
      ...catsData,
      all: all,
    };
  });
  if (statType === 'statRatings') {
    catsList.push(categoryDetails.filter((cat) => cat.name === 'all')[0]);
  } else {
  }

  const catColorRange = {};
  catsList.forEach((cat) => {
    const allValues = data.map((d) => d[cat.name]);

    catColorRange[cat.name] = getStdRange(allValues, 1.5);
  });

  const handleTeamChange = (e) => {
    console.log(e)
    const selectedTeamIds = e.map((o) => o.value);
    const lastSelected = selectedTeamIds.slice(-1)[0];

    const teamIds = selectedTeamIds.filter((v) => v !== 0);

    if (lastSelected === 0) {
      setDisplayList([0]);
    } else {
      setDisplayList(teamIds);
    }
  };

  const handleStatTypeChange = (e) => {
    setStatType(e.target.value);
  };

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const rosterInfo = ``;

  return (
    <Container>
      <TooltipHeader title='Rosters' info={rosterInfo} />
      <FormContainer>
        <MultiSelectCheckbox
          options={teamOptions}
          handleChange={handleTeamChange}
        />
        <DropDown value={statType} onChange={handleStatTypeChange}>
          {statTypeArray.map((o) => {
            return (
              <option value={o} key={o}>
                {o.includes('Ratings') ? 'Ratings' : 'Stats'}
              </option>
            );
          })}
        </DropDown>
        <DropDown value={period} onChange={handlePeriodChange}>
          {periodArray.map((o) => {
            return (
              <option value={o} key={o}>
                {o.replace(/[^0-9](?=[0-9])/g, '$& ')}
              </option>
            );
          })}
        </DropDown>
      </FormContainer>
      <TablesList>
        {displayList.map((teamId) => {
          return (
            <RosterTable
              key={teamId}
              fullTeamName={
                teams.filter((t) => t.teamId === teamId)?.[0]?.fullTeamName
              }
              data={
                teamId !== 0 ? data.filter((p) => p.teamId === teamId) : data
              }
              cats={catsList}
              catColorRange={catColorRange}
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

const FormContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  margin: 0 auto;

  > * {
    margin: 0.25rem 2px;
  }
`;

const DropDown = styled.select``;

const TablesList = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;

  max-width: 100%;
  padding: 0.25rem 0;
`;

export default RosterContainer;
