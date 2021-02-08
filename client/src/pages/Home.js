import React from 'react';
import Layout from '../components/Layout';

import styled from 'styled-components';

function Home(props) {
  return (
    <Layout maxWidth={props.maxWidth}>
      <Container maxWidth={props.maxWidth}>
        <Title>Home</Title>
      </Container>
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

const Title = styled.h2`
  margin: 0 auto;
`

export default Home;
