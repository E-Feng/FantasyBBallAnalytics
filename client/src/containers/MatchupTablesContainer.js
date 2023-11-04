import React, { useState } from 'react';
import styled from 'styled-components';

import MatchupTable from '../tables/MatchupTable';
import { categoryDetails } from '../utils/categoryUtils';


function MatchupTablesContainer(props) {
  const data = props.data;
  const teams = props.teams;
  const settings = props.settings[0].categoryIds;

  const cats = categoryDetails.filter((o) => {
    return settings.includes(o.espnId) && o.name !== 'mins'
  });

  // Joining team names to data
  const joinedData = data.map(row => {
    const team = teams.filter((team) => team.teamId === row.teamId);

    return {
      ...row,
      fullTeamName: team[0].fullTeamName,
      firstName: team[0].firstName
    }
  })

  const [week, setWeek] = useState(props.currentWeek);
  const [teamId, setTeamId] = useState('');
  const [displayList, setDisplayList] = useState(
    joinedData.filter((row) => row.week === week)
  );

  // Adjustment for changing contexts
  if (week > props.currentWeek) {
    setWeek(props.currentWeek);
    setTeamId('');
    setDisplayList(joinedData.filter((row) => row.week === props.currentWeek));
  }

  const weekArray = Array.from(new Array(props.currentWeek), (x, i) => i + 1);

  const handleWeekChange = (e) => {
    const val = parseInt(e.target.value);
    setWeek(val);
    setTeamId('');

    setDisplayList(joinedData.filter((row) => row.week === val));
  };

  const handleTeamIdChange = (e) => {
    const val = parseInt(e.target.value);
    setTeamId(val);
    setWeek('');

    setDisplayList(joinedData.filter((row) => row.teamId === val));
  };

  return (
    <Container>
      <DropDownList>
        <DropDown value={week} onChange={handleWeekChange}>
          <option value='' key={0}>
            Select Week
          </option>
          {weekArray.map((o) => {
            return (
              <option value={o} key={o}>
                Week {o}
              </option>
            );
          })}
        </DropDown>
        <DropDown value={teamId} onChange={handleTeamIdChange}>
          <option value='' key={0}>
            Select Team
          </option>
          {teams.map((o) => {
            return (
              <option value={o.teamId} key={o.teamId}>
                {o.fullTeamName}
              </option>
            );
          })}
        </DropDown>
      </DropDownList>
      <TablesList>
        {displayList.map((displayRow) => {
          return (
            <MatchupTable
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
      </TablesList>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const DropDownList = styled.div`
  display: flex;
  flex-direction: row;

  margin: 0.2rem auto;
`;

const TablesList = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;

  max-width: 100%;
  padding: 1rem 0;
`;

const DropDown = styled.select`
  margin: 0 0.1rem;
`;

export default MatchupTablesContainer;
