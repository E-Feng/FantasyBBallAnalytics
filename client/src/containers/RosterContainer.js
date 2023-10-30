import React, { useState } from 'react';
import styled from 'styled-components';

import TooltipHeader from '../components/TooltipHeader';
import RosterTable from '../tables/RosterTable';

function RosterContainer(props) {
  const [period, setPeriod] = useState('Last15');
  const [displayList, setDisplayList] = useState([1]);

  const players = props.players;
  const teams = props.teams;
  const catIds = props.settings[0].categoryIds;

  const periodArray = ['Last7', 'Last15', 'Last30', 'Season'];
  const ratingsKey = `statRatings${period}`;

  const data = []

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
          return (
            <RosterTable
              key={displayRow.week + displayRow.teamId}
              cats={cats}
              home={displayRow}
              away={joinedData.filter(
                (row) =>
                  row.week === displayRow.week &&
                  row.teamId !== displayRow.teamId
              )}
            />
          );
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
