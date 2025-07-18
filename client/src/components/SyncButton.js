import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { requestLeagueId } from '../utils/webAPI';

function SyncButton(props) {
  const [hasSynced, setHasSynced] = useState(false);
  const { handleSubmit, formState } = useForm();

  const updatedAt = Date.parse(props.updatedAt + 'Z');
  const now = Date.now();

  const outdatedIntervalDays = 1;
  const outdatedInterval = outdatedIntervalDays * 24 * 60 * 60 * 1000;

  const isOutdated =
    now - updatedAt > outdatedInterval || Number.isNaN(updatedAt);

  const onClick = async () => {
    console.log('Syncing league data...');

    const reqPayload = {
      leagueId: props.leagueId,
      platform: '',
      leagueAuthCode: '',
    };
    const [leagueStatus] = await requestLeagueId(reqPayload);

    if (leagueStatus === 'ACTIVE') {
      props.forceRerender();
    } else {
      setHasSynced(true);
    }
  };

  return (
    <Container>
      {isOutdated ? (
        <SyncForm onSubmit={handleSubmit(onClick)}>
          <Button
            type='submit'
            disabled={formState.isSubmitting || hasSynced}
            value='&#8634; Sync'
          />
        </SyncForm>
      ) : (
        <></>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
`;

const SyncForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const Button = styled.input`
  /* margin: 4px 4px; */
`;

export default SyncButton;
