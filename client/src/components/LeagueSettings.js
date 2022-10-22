import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';

import LeagueContext from './LeagueContext';
import LeagueChangeModal from './LeagueChangeModal';

import styled from 'styled-components';

function LeagueSettings() {
  const { leagueKey, id, year, modal } = useContext(LeagueContext);
  const [leagueId, setLeagueId] = id;
  const [leagueYear, setLeagueYear] = year;
  const [showModal, setShowModal] = modal;

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(leagueKey);

  const isDataLoaded = data !== undefined && data !== null;
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

  const yearList =
    isLoading || data['allYears'] === undefined ? ['2023'] : data['allYears'];

  yearList.sort((a, b) => parseInt(b) - parseInt(a));

  
  const leagueDropdownValues = [leagueId, 'Change'];

  // Functions to handle dropdown changes
  const handleLeagueChange = (e) => {
    const value = e.target.value;
    if (value === 'Change') {
      setShowModal(true);
    }
  };

  const handleSeasonChange = (e) => {
    setLeagueYear(e.target.value);
  };

  return (
    <Container>
      <Label>League</Label>
      <Dropdown value={leagueId} onChange={handleLeagueChange}>
        {leagueDropdownValues.map((o) => {
          return (
            <option value={o} key={o}>
              {o}
            </option>
          );
        })}
      </Dropdown>
      <Label>Season</Label>
      <Dropdown value={leagueYear} onChange={handleSeasonChange}>
        {yearList.map((year) => {
          return (
            <option value={year} key={year}>
              {year}
            </option>
          );
        })}
      </Dropdown>
      {showModal && (
        <LeagueChangeModal setShow={setShowModal} setLeagueId={setLeagueId} />
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Label = styled.p`
  text-transform: uppercase;
  text-decoration: none;
`;

const Dropdown = styled.select`
  margin: 0 0.5rem;
`;

export default LeagueSettings;
