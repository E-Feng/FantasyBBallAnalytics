import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';

import Layout from '../components/Layout';
import LeagueContext from '../components/LeagueContext';
import TooltipHeader from '../components/TooltipHeader';
import DraftRecapContainer from '../containers/DraftRecapContainer';
import LoadingIcon from '../components/LoadingIcon';

import styled from 'styled-components';

function DraftRecap(props) {
  const { leagueState } = useContext(LeagueContext);
  const leagueKey = leagueState[0];

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(leagueKey);

  const isDataLoaded = data !== undefined;
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

  const draftData = isLoading ? null : data.draft;
  const teamData = isLoading ? null : data.teams;
  const settingsData = isLoading ? null : data.settings;
  const playersData = isLoading ? null : data.players;

  const isMissingDraftData = isLoading ? null : draftData.length === 0;
  const isMissingPlayerData = isLoading ? null : playersData.length === 0;

  const draftRecapInfo = `This table shows a recap of the draft with the end of
    season stats rating and overall ranking. The pick number to ranking difference 
    is calculated to show a picks relative value to its draft number. This can 
    show underperforming picks to overperformers (sleepers). By default the ratings
    and rankings do not factor in ejections as it is heavily weighted but the option
    to include it is available.`;

  const errorMsg = isMissingDraftData
    ? 'No draft data available for this league'
    : isMissingPlayerData
    ? 'Player Data not available for previous Yahoo leagues'
    : '';

  return (
    <Layout maxWidth={props.maxWidth}>
      {isLoading ? (
        <LoadingIcon />
      ) : isMissingDraftData || isMissingPlayerData ? (
        <MissingDataContainer>{errorMsg}</MissingDataContainer>
      ) : (
        <Container>
          <TooltipHeader title='Draft Recap' info={draftRecapInfo} />
          <DraftRecapContainer
            draft={draftData}
            teams={teamData}
            settings={settingsData}
            players={playersData}
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

const MissingDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  font-size: 36px;
`;

export default DraftRecap;
