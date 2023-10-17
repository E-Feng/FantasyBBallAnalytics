import React, { useState } from 'react';

import DraftRecapTable from '../tables/DraftRecapTable';
import DraftSummaryTable from '../tables/DraftSummaryTable';
import { getPercentageRange, mean } from '../utils/arrayMath';

import styled from 'styled-components';

function DraftRecapContainer(props) {
  const [sortMode, setSortMode] = useState('round');
  const [ejsChecked, setChecked] = useState(false);

  const draft = props.draft;
  const teams = props.teams;
  const players = props.players;

  const sortList = ['round', 'team', 'ranking', 'difference'];

  // const hasEjections = checkLeagueHasEjections(
  //   props.settings[0]['categoryIds']
  // );
  const hasEjections = false;

  // Adjusting raw data, calculating difference
  const data = draft.map((pick) => {
    const team = teams.filter((team) => team.teamId === pick.teamId);
    const player = players.filter(
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
  const summaryData = teams.map((team) => {
    const teamDraft = data.filter((o) => o.teamId === team.teamId);

    const avgRanking = Math.round(mean(teamDraft.map((o) => o.ranking)));
    const avgRating = mean(teamDraft.map((o) => o.rating));
    const avgDifference = mean(teamDraft.map((o) => o.difference));

    return {
      ...team,
      avgRanking: avgRanking,
      avgRating: avgRating,
      avgDifference: avgDifference,
    };
  });

  const dataRatings = data.map((o) => o.rating);
  const ratingsRange = getPercentageRange(dataRatings, 0.05);

  const handleSortChange = (e) => {
    setSortMode(e.target.value);
  };
  const handleCheckbox = (e) => {
    setChecked(!ejsChecked);
  };

  return (
    <Container>
      <DraftSummaryTable data={summaryData} range={ratingsRange} />
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
      <DraftRecapTable data={data} range={ratingsRange} sortMode={sortMode} />
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

  margin-top: 1.5rem;
  margin-bottom: 0.25rem;
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
