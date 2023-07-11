import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { requestLeagueId } from '../utils/webAPI';

function LeagueChangeModal(props) {
  const { register, handleSubmit, errors, formState } = useForm();
  const [responseMsg, setResponseMsg] = useState('');
  const [showCookieForm, setShowCookieForm] = useState(false);

  const requestingMsg = 'Obtaining league data...';

  const responseColor = responseMsg === requestingMsg ? 'yellow' : 'red';

  const closeModal = (e) => {
    const isClosedFromButton = e.target instanceof HTMLButtonElement;
    if (isClosedFromButton || responseMsg !== requestingMsg) {
      props.setShow(false);
    }
  };

  const toggleCookieForm = () => {
    setShowCookieForm(!showCookieForm);
  };

  const onSubmit = async (data) => {
    const newLeagueId = data.leagueId;

    if (newLeagueId === '00000001') {
      props.setShow(false);
      props.setLeagueId(newLeagueId);
      return;
    }

    setResponseMsg(requestingMsg);

    const reqPayload = {
      leagueId: newLeagueId,
      platform: 'espn',
      cookieEspnS2: data.cookieEspnS2,
    };

    const leagueStatus = await requestLeagueId(reqPayload);
    console.log(leagueStatus);
    switch (leagueStatus) {
      case 'ACTIVE':
        localStorage.setItem('leagueId', newLeagueId);
        props.setShow(false);
        props.setLeagueId(newLeagueId);
        break;
      case 'AUTH_LEAGUE_NOT_VISIBLE':
        setResponseMsg(
          'League is private, enter in correct cookie information.'
        );
        break;
      case 'GENERAL_NOT_FOUND':
        setResponseMsg('League id not found or deleted.');
        break;
      default:
        setResponseMsg('Error obtaining league information.');
    }
  };

  const description1 = `View league id or have league processed 
    and analyzed, please allow a minute (1) to process. Public 
    ESPN leagues are seamlessly supported, private leagues require 
    cookie information [`;
  const description2 = `]. Yahoo leagues not currently planned.`;

  const cookieInfoLink =
    'https://chrome.google.com/webstore/detail/espn-cookie-finder/oapfffhnckhffnpiophbcmjnpomjkfcj';

  return ReactDOM.createPortal(
    <>
      <Modal extra={showCookieForm}>
        <Header>View/Process League Id</Header>
        <h4>ESPN Leagues Only</h4>
        <Text>
          {description1}
          <a href={cookieInfoLink}>info</a>
          {description2}
        </Text>
        <URLExample>
          https://fantasy.espn.com/basketball/league?leagueId=
          <Underline>890123456</Underline>
        </URLExample>
        <LeagueForm onSubmit={handleSubmit(onSubmit)}>
          <FormLabel>League Id </FormLabel>
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
          {errors.leagueId && <ErrorMsg>League Id Field Required</ErrorMsg>}
          <CookieToggle onClick={toggleCookieForm}>
            Cookie Info For Private Leagues Only{' '}
            {showCookieForm ? <span>&#9650;</span> : <span>&#9660;</span>}
          </CookieToggle>
          {showCookieForm && (
            <CookieFormContainer>
              <CookieField>
                <FormLabel>Espn S2</FormLabel>
                <CookieInput
                  type='text'
                  name='cookieEspnS2'
                  placeholder='AEA1B2C3D4E5F6G7H8I9J10.........'
                  ref={register()}
                  disabled={formState.isSubmitting}
                />
              </CookieField>
            </CookieFormContainer>
          )}
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
  max-height: ${(props) => (props.extra ? '410px' : '360px')};
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

const FormLabel = styled.label`
  width: 73px;
`;

const LeagueInput = styled.input`
  margin-top: 1rem;
  margin-bottom: 0.5rem;
`;

const CookieToggle = styled.p`
  text-align: center;
  margin-bottom: 0.25rem;
`;

const CookieFormContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CookieField = styled.div`
  display: flex;
  flex-direction: row;

  margin: 0.15rem 0;
`;

const CookieInput = styled.input`
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
  flex-grow: 0;
`;

const CloseForm = styled.button`
  font-size: 12px;
  color: white;
  background-color: transparent;
  border: 0;
  padding: 0;
  text-decoration: underline;
  cursor: pointer;
  margin: 0.75rem auto;
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
