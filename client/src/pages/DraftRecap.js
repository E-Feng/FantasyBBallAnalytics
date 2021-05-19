import React from 'react';
import { useQueryClient, useIsFetching } from 'react-query';

import Layout from '../components/Layout';
import TooltipHeader from '../components/TooltipHeader';
import DraftRecapContainer from '../containers/DraftRecapContainer';

import styled from 'styled-components';

function DraftRecap(props) {
  const queryClient = useQueryClient();
  const draftData = queryClient.getQueryData('draftrecap.json')
  const teamData = queryClient.getQueryData('teams.json')

  const draftRecapInfo = `This table `

  return (
    <Layout maxWidth={props.maxWidth}>
      <Container>
        <TooltipHeader 
          title='Draft Recap'
          info={draftRecapInfo}
        />
        <DraftRecapContainer
          data={draftData}
          teams={teamData}
        />
      </Container>
    </Layout>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${(props) => props.maxWidth}px;
  margin: 0 auto;
`

export default DraftRecap;