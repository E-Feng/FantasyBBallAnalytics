import React, { useContext } from 'react';

import SeasonContext from '../components/SeasonContext';

import styled from 'styled-components';

function SeasonDropdown() {
  const { seasonYear, setSeasonYear } = useContext(SeasonContext);

  const handleSeasonChange = (e) => {
    setSeasonYear(e.target.value);
  };

  const yearList = ['2021', '2020'];

  return (
    <Container>
      <Label>Season</Label>
      <Dropdown value={seasonYear} onChange={handleSeasonChange}>
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
