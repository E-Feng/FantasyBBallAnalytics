import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';
import styled from 'styled-components';

import Layout from '../components/Layout';
import LeagueContext from '../components/LeagueContext';
import MatchupTablesContainer from '../containers/MatchupTablesContainer';
import TotalsContainer from '../containers/TotalsContainer';
import TooltipHeader from '../components/TooltipHeader';
import LoadingIcon from '../components/LoadingIcon';
import RotoError from '../components/RotoError';

function Scoreboard(props) {
  const { leagueState } = useContext(LeagueContext);
  const leagueKey = leagueState[0];

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(leagueKey);

  const isDataLoaded = data !== undefined && data !== null;
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
      ) : isRotoLeague ? (
        <RotoError />
      ) : (
        <Container maxWidth={props.maxWidth}>
          <TooltipHeader
            title='Total Category Record'
            info={totalCategoryInfo}
          />
          <TotalsContainer
            data={scoreboardData}
            teams={teamData}
            settings={settingsData}
            currentWeek={currentWeek}
          ></TotalsContainer>
          <TooltipHeader
            title='Weekly Matchup Comparisons'
            info={weeklyMatchupInfo}
          />
          <MatchupTablesContainer
            data={scoreboardData}
            teams={teamData}
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

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export default Scoreboard;
