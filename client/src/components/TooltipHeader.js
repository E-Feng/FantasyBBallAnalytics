import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

import styled from 'styled-components';

function TooltipHeader(props) {
  return (
    <Container>
      <Title>{props.title}</Title>
      <PopUpWrapper>
        <Icon></Icon>
        <PopUp>{props.info}</PopUp>
      </PopUpWrapper>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0.5rem auto 0 auto;
`;

const Title = styled.h1`
  text-align: center;
`;

const PopUp = styled.p`
  display: block;
  position: absolute;
  color: white;
  background-color: dimgrey;
  padding: 0.5em 1em;
  border: 1px solid white;
  font-size: 1em;
  min-width: 100px;
  max-width: 320px;
  z-index: 3;

  margin-top: 30px;
  margin-left: -160px;
  margin-right: 1px;

  transform: scale(0);
  transition: transform ease-out 150ms, bottom ease-out 150ms;

  @media (max-width: 420px) {
    max-width: 280px;
    right: 0;
  }
`;

const Icon = styled(FaInfoCircle)`
  position: relative;
  font-size: 1em;
`;

const PopUpWrapper = styled.div`
  display: flex;
  height: 20px;
  margin: 0.1rem 0.25rem;

  &:hover ${PopUp} {
    transform: scale(1);
  }
`

export default TooltipHeader;
