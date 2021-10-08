import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';

import LeagueContext from './LeagueContext';

import styled from 'styled-components';

function SeasonDropdown() {
  const { leagueKey, setters } = useContext(LeagueContext);
  const leagueYear = leagueKey[1];
  const setLeagueYear = setters[1];

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(leagueKey);

  const isDataLoaded = (data !== undefined);
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

  const yearList = isLoading ? ['2021'] : data['allYears']

  const handleSeasonChange = (e) => {
    setLeagueYear(e.target.value);
  };

  return (
    <Container>
      <Label>Season</Label>
      <Dropdown value={leagueYear} onChange={handleSeasonChange}>
        {yearList.map(year => {
          return (
            <option value={year} key={year}>
              {year}
            </option>
          )
        })}
      </Dropdown>
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

export default SeasonDropdown;
