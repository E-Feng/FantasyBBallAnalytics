import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';
import styled from 'styled-components';

import Layout from '../components/Layout';
import LeagueContext from '../components/LeagueContext';
import TooltipHeader from '../components/TooltipHeader';
import LoadingIcon from '../components/LoadingIcon';
import TeamTotalsContainer from '../containers/TeamTotalsContainer';

function Teams(props) {
  const { leagueKey } = useContext(LeagueContext);

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(leagueKey);

  const isDataLoaded = data !== undefined && data !== null;
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

  const teamData = isLoading ? null : data.teams;
  const playerData = isLoading ? null : data.players;
  const settingsData = isLoading ? null : data.settings;

  const teamTotalsInfo = ``;

  return (
    <Layout maxWidth={props.maxWidth}>
      {isLoading ? (
        <LoadingIcon />
      ) : (
        <Container maxWidth={props.maxWidth}>
          <TooltipHeader
            title='Team Power Rankings'
            info={teamTotalsInfo}
          />
          <TeamTotalsContainer
            players={playerData}
            teams={teamData}
            settings={settingsData}
          ></TeamTotalsContainer>
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

export default Teams;
