import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';

import Layout from '../components/Layout';
import SeasonContext from '../components/SeasonContext';
import TooltipHeader from '../components/TooltipHeader';
import DraftRecapContainer from '../containers/DraftRecapContainer';
import LoadingIcon from '../components/LoadingIcon';

import styled from 'styled-components';

function DraftRecap(props) {
  const { seasonYear } = useContext(SeasonContext);

  const queryClient = useQueryClient();
  const draftData = queryClient.getQueryData([seasonYear, 'draftRecap']);
  const teamData = queryClient.getQueryData([seasonYear, 'teams']);

  const isDataLoaded = (draftData !== undefined && teamData !== undefined);
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

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
          <DraftRecapContainer data={draftData} teams={teamData} />
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
