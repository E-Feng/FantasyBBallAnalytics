import React from 'react';
import styled from 'styled-components';

import Layout from '../components/Layout';

function Error(props) {
  const isLeagueError = props.isLeagueError;

  const pageError = 'Page not found, try a link above.'
  const leagueError = 'League ID not found, please wait for update.'

  const errorText = isLeagueError ? leagueError : pageError;

  return (
    <Layout maxWidth={props.maxWidth} isError={true}>
      <Container>
        <ErrorCode>404</ErrorCode>
        <ErrorMessage>{errorText}</ErrorMessage>
      </Container>
    </Layout>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  margin: 0 1rem;
`;

const ErrorCode = styled.div`
  font-size: 112px;
`

const ErrorMessage = styled.p`
  font-size: 32px;
  text-align: center;
`

export default Error;
