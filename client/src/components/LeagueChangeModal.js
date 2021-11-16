import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { requestLeagueId } from '../utils/webAPI';

function LeagueChangeModal(props) {
  const { register, handleSubmit, errors, formState } = useForm();
  const [responseMsg, setResponseMsg] = useState('');

  const responseColor = responseMsg.includes('requested') ? 'green' : 'red';

  const closeModal = () => {
    props.setShow(false);
  };

  const onSubmit = async (data) => {
    const newLeagueId = data.leagueId;

    const leagueStatus = await requestLeagueId(newLeagueId);
    console.log(leagueStatus);
    switch (leagueStatus) {
      case 'ACTIVE':
        localStorage.setItem('leagueId', newLeagueId);
        props.setLeagueId(newLeagueId);
        closeModal();
        break;
      case 'PENDING':
        setResponseMsg('League Id requested.');
        break;
      case 'AUTH_LEAGUE_NOT_VISIBLE':
        setResponseMsg('League is private, please contact for more information.');
        break;
      default:
        setResponseMsg('Error requesting league id, not found or deleted.');
        break;
    }
  };

  const description = `Change league id or request league to be added during 
    next update cycle (daily). Currently public ESPN leagues are seamlessly
    supported, contact for private leagues. Yahoo leagues not currently
    planned.`;

  return ReactDOM.createPortal(
    <>
      <Modal>
        <Header>Change/Request League Id</Header>
        <h4>ESPN Public Only*</h4>
        <Text>{description}</Text>
        <URLExample>
          https://fantasy.espn.com/basketball/league?leagueId=
          <Underline>890123456</Underline>
        </URLExample>
        <LeagueForm onSubmit={handleSubmit(onSubmit)}>
          <label>League Id: </label>
          <LeagueInput
            type='text'
            name='leagueId'
            placeholder='eg. 890123456'
            ref={register({ required: true })}
            disabled={formState.isSubmitting}
          />
          <input
            type='submit'
            value='Submit'
            disabled={formState.isSubmitting}
          />
          {errors.leagueId && <ErrorMsg>Field Required</ErrorMsg>}
          <ResponseMsg color={responseColor}>{responseMsg}</ResponseMsg>
        </LeagueForm>
        <Filler />
        <CloseForm onClick={closeModal}>Close/Browse</CloseForm>
      </Modal>
      <Overlay onClick={closeModal}></Overlay>
    </>,
    document.getElementById('modal')
  );
}

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  height: 325px;
  width: 600px;
  max-width: 95%;
  background-color: black;
  border: 2px white solid;

  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 450px) {
    height: 450px;
  }
`;

const Header = styled.h1`
  text-align: center;
  margin-top: 1rem;
`;

const Text = styled.p`
  text-align: center;
  max-width: 85%;
  margin: 1.25rem auto;
`;

const URLExample = styled.p`
  text-align: center;
  font-size: 14px;
`;

const Underline = styled.span`
  text-decoration: underline;
`;

const LeagueForm = styled.form``;

const LeagueInput = styled.input`
  margin-top: 1rem;
  margin-bottom: 0.5rem;
`;

const ErrorMsg = styled.p`
  color: red;
  text-align: center;
`;

const ResponseMsg = styled.p`
  color: ${(props) => props.color};
  font-size: 14px;
  text-align: center;
`;

const Filler = styled.div`
  flex-grow: 2;
`;

const CloseForm = styled.button`
  font-size: 12px;
  color: white;
  background-color: transparent;
  border: 0;
  padding: 0;
  text-decoration: underline;
  cursor: pointer;
  margin: 1rem auto;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.8);
`;

export default LeagueChangeModal;
