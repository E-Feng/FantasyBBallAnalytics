import { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';
import styled from 'styled-components';

import LeagueContext from './LeagueContext';
import LeagueChangeModal from './LeagueChangeModal';
import StatusIndicator from './StatusIndicator';
import SyncButton from './SyncButton';

function LeagueSettings() {
  const { leagueState, modalState } = useContext(LeagueContext);
  const [leagueKey, setLeagueKey] = leagueState;
  const [showModal, setShowModal] = modalState;

  const [leagueId, leagueYear] = leagueKey;

  const forceRerender = () => setLeagueKey([leagueId + ' ', leagueYear]);

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(leagueKey);

  const isDataLoaded = data !== undefined && data !== null;
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

  const leagueKeysList = isLoading ? [leagueKey] : data['allLeagueKeys'];
  leagueKeysList.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));

  const leagueIdList = leagueKeysList.map((o) => o[0]);
  const leagueYearList = leagueKeysList.map((o) => o[1]);

  const isSameLeagueId = leagueIdList.every((v) => v === leagueIdList[0]);

  const leagueDropdownValues = isSameLeagueId
    ? [leagueIdList[0], 'Change']
    : [...leagueIdList, 'Change'];

  // Functions to handle dropdown changes
  const handleLeagueChange = (e) => {
    const value = e.target.value;
    const index = e.target.selectedIndex;
    if (value === 'Change') {
      setShowModal(true);
      return;
    }
    setLeagueKey(leagueKeysList[index]);
  };

  const handleSeasonChange = (e) => {
    const index = e.target.selectedIndex;
    setLeagueKey(leagueKeysList[index]);
  };

  return (
    <Container>
      <Label>League</Label>
      <Dropdown value={leagueId} onChange={handleLeagueChange}>
        {leagueDropdownValues.map((o) => {
          const raw = o?.includes('.l.') ? o.split('.l.')[1] : o;
          return (
            <option value={o} key={o}>
              {raw}
            </option>
          );
        })}
      </Dropdown>
      <StatusIndicator updatedAt={data?.updatedAt} />
      <SyncButton
        leagueId={leagueId}
        updatedAt={data?.updatedAt}
        forceRerender={forceRerender}
      />
      <Label>Season</Label>
      <Dropdown value={leagueYear} onChange={handleSeasonChange}>
        {leagueYearList.map((year, i) => {
          const key = `${year}_${i}`;
          return (
            <option value={year} key={key}>
              {year}
            </option>
          );
        })}
      </Dropdown>
      {showModal && (
        <LeagueChangeModal setShow={setShowModal} setLeagueKey={setLeagueKey} />
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

  margin-left: 0.35rem;
`;

const Dropdown = styled.select`
  margin-left: 0.25rem;
`;

export default LeagueSettings;
