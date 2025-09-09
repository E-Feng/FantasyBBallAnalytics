import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';
import styled from 'styled-components';

import Layout from '../components/Layout';
import LeagueContext from '../components/LeagueContext';
import LoadingIcon from '../components/LoadingIcon';
import TeamRankingsContainer from '../containers/TeamRankingsContainer';
import RosterContainer from '../containers/RosterContainer';

function Teams(props) {
  const { leagueState } = useContext(LeagueContext);
  const leagueKey = leagueState[0];

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(leagueKey);

  const isDataLoaded = data !== undefined && data !== null;
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

  const isMissingRosterData = isLoading ? null : data.rosters.length === 0;
  const isMissingPlayerData = isLoading ? null : data.players.length === 0;

  const errorMsg = isMissingRosterData
    ? 'No roster data available for this league'
    : isMissingPlayerData
    ? 'Player Data not available for previous Yahoo leagues'
    : '';

  return (
    <Layout maxWidth={props.maxWidth}>
      {isLoading ? (
        <LoadingIcon />
      ) : isMissingRosterData || isMissingPlayerData ? (
        <MissingDataContainer>{errorMsg}</MissingDataContainer>
      ) : (
        <Container maxWidth={props.maxWidth}>
          <TeamRankingsContainer leagueData={data} />
          <RosterContainer leagueData={data} />
        </Container>
      )}
    </Layout>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${(props) => props.maxWidth}px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MissingDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  font-size: 36px;
`;

export default Teams;
