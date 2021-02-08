import React from 'react';
import { useQueryClient, useIsFetching } from 'react-query';

import Layout from '../components/Layout';
import MatchupTablesContainer from '../containers/MatchupTablesContainer';
import TotalsContainer from '../containers/TotalsContainer';

import styled from 'styled-components';

function TeamStats(props) {
  const queryClient = useQueryClient();
  const scoreboardData = queryClient.getQueryData('scoreboard.json');
  const teamData = queryClient.getQueryData('team.json');

  const isLoading = useIsFetching();

  let currentWeek = 1;
  if (!isLoading) {
    currentWeek = scoreboardData[scoreboardData.length - 1].week;
  }

  if (isLoading) return 'Loading...';

  return (
    <Layout maxWidth={props.maxWidth}>
      <Container maxWidth={props.maxWidth}>
        <Title>Total Category Record</Title>
        <TotalsContainer
          data={scoreboardData}
          teams={teamData}
          currentWeek={currentWeek}
        ></TotalsContainer>
        <Title>Weekly Matchup Comparisons</Title>
        <MatchupTablesContainer
          data={scoreboardData}
          teams={teamData}
          currentWeek={currentWeek}
        />
      </Container>
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

const Title = styled.h1`
  text-align: center;

  margin-top: 1rem;
`;

export default TeamStats;
