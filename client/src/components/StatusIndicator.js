import styled from 'styled-components';

function StatusIndicator(props) {
  const updatedAt = Date.parse(props.updatedAt + 'Z');
  const now = Date.now();
  const hoursAgo = Math.floor((now - updatedAt) / (1000 * 60 * 60));

  const outdatedIntervalDays = 1;
  const outdatedInterval = outdatedIntervalDays * 24 * 60 * 60 * 1000;

  const isOutdated =
    now - updatedAt > outdatedInterval || Number.isNaN(updatedAt);

  const outdatedInfo = `Sync to fetch updated league data. If this warning is
    still here your league is outdated due to failed authorization, open the 
    'Change' league option to the left and redo authorization to update, 
    then refresh again.
  `;
  const info = `League data is up to date, last updated at ${new Date(
    updatedAt
  ).toLocaleString()} (${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago).`;

  return (
    <Container>
      {isOutdated ? (
        <Indicator>
          ⚠️<PopUp>{outdatedInfo}</PopUp>
        </Indicator>
      ) : (
        <Indicator>
          ✔️<PopUp>{info}</PopUp>
        </Indicator>
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

export default StatusIndicator;
