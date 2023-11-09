import React from 'react';

import styled from 'styled-components';

function OutdatedIndicator(props) {
  const updatedAt = Date.parse(props.updatedAt + 'Z');
  const now = Date.now();

  const interval = 1 * 24 * 60 * 60 * 1000; // 1 day in milliseconds

  const isOutdated = now - updatedAt > interval;

  const info = `League is outdated due to failed authorization, open the 'Change'
    league option to the left and redo authorization to update, then refresh
    the page. If the indicator disappears, your league is now up to date.
  `;

  return (
    <Container>
      {isOutdated ? (
        <Indicator>
          ⚠️<PopUp>{info}</PopUp>
        </Indicator>
      ) : (
        <></>
      )}
    </Container>
  );
}

const Container = styled.div``;

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

const Indicator = styled.div`
  display: flex;
  cursor: default;

  &:hover ${PopUp} {
    transform: scale(1);
  }
`;

export default OutdatedIndicator;
