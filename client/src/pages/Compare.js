import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';
import styled from 'styled-components';

import Layout from '../components/Layout';
import SeasonContext from '../components/SeasonContext';
import CompareContainer from '../containers/CompareContainer';
import TooltipHeader from '../components/TooltipHeader';
import LoadingIcon from '../components/LoadingIcon';

function Compare(props) {
  const { seasonYear } = useContext(SeasonContext);

  const queryClient = useQueryClient();
  const scoreboardData = queryClient.getQueryData([seasonYear, 'scoreboard']);
  const teamData = queryClient.getQueryData([seasonYear, 'teams']);

  const isDataLoaded = scoreboardData !== undefined && teamData !== undefined;
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

  let currentWeek = 1;
  if (!isLoading) {
    currentWeek = scoreboardData[scoreboardData.length - 1].week;
  }

  const compareInfo = `Compare two teams`;

  return (
    <Layout maxWidth={props.maxWidth}>
      {isLoading ? (
        <LoadingIcon />
      ) : (
        <Container maxWidth={props.maxWidth}>
          <TooltipHeader title='Compare Teams' info={compareInfo} />
          <CompareContainer
            teams={teamData}
            data={scoreboardData}
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

export default Compare;
