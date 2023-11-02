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

  const isMissingPlayerData = isLoading ? null : data.players.length === 0;

  return (
    <Layout maxWidth={props.maxWidth}>
      {isLoading ? (
        <LoadingIcon />
      ) : isMissingPlayerData ? (
        <MissingDataContainer>
          Player Data not available for previous Yahoo leagues
        </MissingDataContainer>
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
