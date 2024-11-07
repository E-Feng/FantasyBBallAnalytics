import React from 'react';
import styled from 'styled-components';

function RotoError() {
  return (
    <RotoErrorContainer>
      <RotoErrorText>Team Stats not available for Roto leagues</RotoErrorText>
    </RotoErrorContainer>
  );
}

const RotoErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const RotoErrorText = styled.p`
  font-size: 36px;
`;

export default RotoError;
