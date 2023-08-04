import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';

import Layout from '../components/Layout';
import LeagueContext from '../components/LeagueContext';
import TooltipHeader from '../components/TooltipHeader';
import DraftRecapContainer from '../containers/DraftRecapContainer';
import LoadingIcon from '../components/LoadingIcon';

import styled from 'styled-components';

function DraftRecap(props) {
  const { leagueKey } = useContext(LeagueContext);

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(leagueKey);

  const isDataLoaded = data !== undefined;
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

  const draftData = isLoading ? null : data.draft;
  const teamData = isLoading ? null : data.teams;
  const settingsData = isLoading ? null : data.settings;
  const playersData = isLoading ? null : data.players;

  const draftRecapInfo = `This table shows a recap of the draft with the end of
    season stats rating and overall ranking. The pick number to ranking difference 
    is calculated to show a picks relative value to its draft number. This can 
    show underperforming picks to overperformers (sleepers). By default the ratings
    and rankings do not factor in ejections as it is heavily weighted but the option
    to include it is available.`;

  return (
    <Layout maxWidth={props.maxWidth}>
      {isLoading ? (
        <LoadingIcon />
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

export default DraftRecap;
