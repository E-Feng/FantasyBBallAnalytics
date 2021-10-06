import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';

import Layout from '../components/Layout';
import SeasonContext from '../components/SeasonContext';
import MatchupTablesContainer from '../containers/MatchupTablesContainer';
import TotalsContainer from '../containers/TotalsContainer';
import TooltipHeader from '../components/TooltipHeader';
import LoadingIcon from '../components/LoadingIcon';

import styled from 'styled-components';

function TeamStats(props) {
  const { seasonYear } = useContext(SeasonContext);

  const queryClient = useQueryClient();
  const scoreboardData = queryClient.getQueryData(['scoreboard']);
  const teamData = queryClient.getQueryData(['teams']);

  const isDataLoaded = (scoreboardData !== undefined && teamData !== undefined);
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

  let currentWeek = 1;
  if (!isLoading) {
    currentWeek = scoreboardData[scoreboardData.length - 1].week;
  }

  const totalCategoryInfo = `This table calculates the total category record compared to 
    everyone else regardless of matchup unless the (Only Matchups) checkbox is selected. 
    Numbers represented are percentages and color coded for better visuals. A weekly 
    slider range is available to filter specific week ranges.`;
  const weeklyMatchupInfo = `These tables show the matchup compared to everyone else, 
    with the scheduled matchup bordered in blue. Filters available to go through 
    each week or team.`;

  return (
    <Layout maxWidth={props.maxWidth}>
      {isLoading ? (
        <LoadingIcon />
      ) : (
        <Container maxWidth={props.maxWidth}>
          <TooltipHeader
            title='Total Category Record'
            info={totalCategoryInfo}
          />
          <TotalsContainer
            data={scoreboardData}
            teams={teamData}
            currentWeek={currentWeek}
          ></TotalsContainer>
          <TooltipHeader
            title='Weekly Matchup Comparisons'
            info={weeklyMatchupInfo}
          />
          <MatchupTablesContainer
            data={scoreboardData}
            teams={teamData}
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

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export default TeamStats;
