import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';
import styled from 'styled-components';

import Layout from '../components/Layout';
import LeagueContext from '../components/LeagueContext';
import BoxScoresContainer from '../containers/BoxScoresContainer';
import TooltipHeader from '../components/TooltipHeader';
import LoadingIcon from '../components/LoadingIcon';
import RotoError from '../components/RotoError';

function Matchups(props) {
  const { leagueState } = useContext(LeagueContext);
  const leagueKey = leagueState[0];
  const leagueYear = leagueKey[1];

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(leagueKey);
  const commonData = queryClient.getQueryData([leagueYear, 'common']);

  const isDataLoaded = data !== undefined && data !== null;
  const isCommonDataLoaded = commonData !== undefined && commonData !== null;
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || !isCommonDataLoaded || isFetching;

  const settingsData = isLoading ? null : data.settings;

  const isRotoLeague =
    isLoading ||
    settingsData[0].scoringType === 'ROTO' ||
    typeof scoreboardData === 'string';

  const matchUpInfo = `This table shows the current box scores and projections
    with the players Last15 stats and remaining games. Diff(erences) are calculated
    and color coded to show the closeness. Player games can be toggled to show
    new projections.`;

  return (
    <Layout maxWidth={props.maxWidth}>
      {isLoading ? (
        <LoadingIcon />
      ) : isRotoLeague ? (
        <RotoError />
      ) : (
        <RootContainer maxWidth={props.maxWidth}>
          <TooltipHeader title='Box Scores' info={matchUpInfo} />
          <BoxScoresContainer data={data} commonData={commonData} />
        </RootContainer>
      )}
    </Layout>
  );
}

const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${(props) => props.maxWidth}px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export default Matchups;
