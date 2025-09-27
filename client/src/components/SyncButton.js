import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { requestLeagueId } from '../utils/webAPI';

function SyncButton(props) {
  const [syncStatus, setSyncStatus] = useState(null);
  const { handleSubmit, formState } = useForm();

  const updatedAt = Date.parse(props.updatedAt + 'Z');
  const now = Date.now();

  const outdatedIntervalDays = 1;
  const outdatedInterval = outdatedIntervalDays * 24 * 60 * 60 * 1000;

  const isOutdated =
    now - updatedAt > outdatedInterval || Number.isNaN(updatedAt);

  const onClick = async () => {
    setSyncStatus(true);

    const reqPayload = {
      leagueId: props.leagueId,
      platform: '',
      leagueAuthCode: '',
    };
    const [leagueStatus] = await requestLeagueId(reqPayload);

    if (leagueStatus === 'ACTIVE') {
      props.forceRerender();
    } else {
      setSyncStatus(false);
      props.setShowModal(true);
    }
  };

  return (
    <Container>
      {isOutdated ? (
        <SyncForm onSubmit={handleSubmit(onClick)}>
          <Button
            type='submit'
            disabled={formState.isSubmitting || syncStatus !== null}
            value='&#8634; Sync'
            syncStatus={syncStatus}
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
  /* background-color: ${(props) => (props.syncStatus === false ? 'red' : '#fff')}; */
`;

export default SyncButton;
