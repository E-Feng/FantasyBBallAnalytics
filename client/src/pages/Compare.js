import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';
import styled from 'styled-components';

import Layout from '../components/Layout';
import LeagueContext from '../components/LeagueContext';
import CompareContainer from '../containers/CompareContainer';
import TooltipHeader from '../components/TooltipHeader';
import LoadingIcon from '../components/LoadingIcon';

function Compare(props) {
  const { leagueState } = useContext(LeagueContext);
  const leagueKey = leagueState[0];
  
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(leagueKey);

  const isDataLoaded = data !== undefined;
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

  const scoreboardData = isLoading ? null : data.scoreboard;
  const teamData = isLoading ? null : data.teams;
  const settingsData = isLoading ? null : data.settings;

  let currentWeek = 1;
  let isRotoLeague = false;
  if (!isLoading && scoreboardData.length) {
    currentWeek = settingsData[0].currentWeek;
    isRotoLeague =
      settingsData[0].scoringType === 'ROTO' ||
      typeof scoreboardData === 'string';
  }

  const compareInfo = `Select two teams to compare weekly head to head 
    categories with a summary all weeks. It is color coded relative to 
    the average of all selected teams.`;

  return (
    <Layout maxWidth={props.maxWidth}>
      {isLoading ? (
        <LoadingIcon />
      ) : isRotoLeague ? (
        <RotoErrorContainer>
          <RotoError>Compare not available for Roto leagues</RotoError>
        </RotoErrorContainer>
      ) : (
        <Container maxWidth={props.maxWidth}>
          <TooltipHeader title='Compare Teams' info={compareInfo} />
          <CompareContainer
            teams={teamData}
            data={scoreboardData}
            settings={settingsData}
            currentWeek={currentWeek}
          />
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
`;

const RotoErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const RotoError = styled.p`
  font-size: 36px;
`;

export default Compare;
