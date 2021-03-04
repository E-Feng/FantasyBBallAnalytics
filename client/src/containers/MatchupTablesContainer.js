import React, { useState } from 'react';
import MatchupTable from '../components/MatchupTable';

import styled from 'styled-components';

function MatchupTablesContainer(props) {
  const data = props.data;
  const teams = props.teams;

  const [week, setWeek] = useState(props.currentWeek);
  const [teamId, setTeamId] = useState('');
  const [displayList, setDisplayList] = useState(
    data.filter((row) => row.week === props.currentWeek)
  );

  const weekArray = Array.from(new Array(props.currentWeek), (x, i) => i + 1);
  const teamArray = teams.map(o => o.teamId);

  const teamObj = {}
  teams.forEach(team => {
    teamObj[team.teamId] = {
      'fullTeamName': team.fullTeamName,
      'firstName': team.firstName
    }
  })

  const handleWeekChange = (e) => {
    const val = parseInt(e.target.value);
    setWeek(val);
    setTeamId('');

    setDisplayList(data.filter((row) => row.week === val));
  };

  const handleTeamIdChange = (e) => {
    const val = parseInt(e.target.value);
    setTeamId(val);
    setWeek('');

    setDisplayList(data.filter((row) => row.teamId === val));
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
          {teamArray.map((o) => {
            return (
              <option value={o} key={o}>
                {teamObj[o].fullTeamName}
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
              teamKey={teamObj}
              home={displayRow}
              away={data.filter(
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
