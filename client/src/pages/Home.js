import React from 'react';

import Layout from '../components/Layout';
import MessageBoard from '../components/MessageBoard';
import TooltipHeader from '../components/TooltipHeader';

import styled from 'styled-components';

function Home(props) {
  const leagueBoardInfo = `League board for messages and daily alerts. Nightly notable 
    statlines are posted according to high gamescore with best free agent game in 
    the format:
    PTS/REBS/ASTS/STLS/BLKS/TOS (FGs, 3s, FTs)`;

  return (
    <Layout maxWidth={props.maxWidth}>
      <Container maxWidth={props.maxWidth}>
        <TooltipHeader
          title='League Board and Alerts'
          info={leagueBoardInfo}
        ></TooltipHeader>
        <MessageBoard></MessageBoard>
      </Container>
    </Layout>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  max-width: ${(props) => props.maxWidth}px;
  margin: 0 auto;
`;

export default Home;
