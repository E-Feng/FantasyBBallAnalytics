import React, { useState } from 'react';

import DraftRecapTable from '../tables/DraftRecapTable';
import { checkLeagueHasEjections } from '../utils/categoryUtils';

import styled from 'styled-components';

function DraftRecapContainer(props) {
  const [sortMode, setSortMode] = useState('round');
  const [ejsChecked, setChecked] = useState(false);

  const sortList = ['round', 'team', 'ranking', 'difference'];

  // const hasEjections = checkLeagueHasEjections(
  //   props.settings[0]['categoryIds']
  // );
  const hasEjections = false;

  // Adjusting raw data, calculating difference
  const data = props.draft.map((pick) => {
    const team = props.teams.filter((team) => team.teamId === pick.teamId);
    const player = props.players.filter(
      (player) => player.playerId === pick.playerId
    )[0];

    const ranking = ejsChecked
      ? player?.totalRankingSeason
      : player?.totalRankingSeason;
    const rating = ejsChecked
      ? player?.totalRatingSeason
      : player?.totalRatingSeason;
    const difference = ranking ? pick.pickNumber - ranking : null;

    return {
      ...pick,
      fullTeamName: team[0]?.fullTeamName,
      playerName: player?.playerName,
      ranking: ranking,
      rating: rating,
      difference: difference,
    };
  });
  console.log(data)

  const handleSortChange = (e) => {
    setSortMode(e.target.value);
  };
  const handleCheckbox = (e) => {
    setChecked(!ejsChecked);
  };

  return (
    <Container>
      <Forms>
        <DropDown value={sortMode} onChange={handleSortChange}>
          {sortList.map((mode) => {
            const capital = mode[0].toUpperCase() + mode.slice(1);
            return (
              <option value={mode} key={mode}>
                Sort By {capital}
              </option>
            );
          })}
        </DropDown>
        {hasEjections ? (
          <Checkbox>
            <input
              type='checkbox'
              checked={ejsChecked}
              onChange={handleCheckbox}
            />
            Count Ejections
          </Checkbox>
        ) : (
          <br />
        )}
      </Forms>
      <DraftRecapTable data={data} sortMode={sortMode} />
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

const DropDown = styled.select`
  margin: 0 0.1rem;
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

export default DraftRecapContainer;
