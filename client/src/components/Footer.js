import React from 'react';
import styled from 'styled-components';

function Footer() {
  return (
    <Container>
      <p>Test</p>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 32px;

  border-top: 2px white solid;
`

export default Footer;