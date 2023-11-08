import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import LeagueContext from './LeagueContext';
import { requestLeagueId } from '../utils/webAPI';

function LeagueChangeModal(props) {
  const { register, handleSubmit, errors, getValues, formState } = useForm();
  const [responseMsg, setResponseMsg] = useState('');
  const { defaultLeagueYear } = useContext(LeagueContext);

  const requestingMsg = 'Obtaining league data...';

  const responseColor = responseMsg === requestingMsg ? 'yellow' : 'red';

  const closeModal = (e) => {
    const isClosedFromButton = e.target instanceof HTMLButtonElement;
    if (isClosedFromButton || responseMsg !== requestingMsg) {
      props.setShow(false);
    }
  };

  const isOnlyOnePlatform = () => {
    const espnVal = getValues('cookieEspnS2');
    const yahooVal = getValues('yahooAuthCode');

    const onlyOneFilled = !(espnVal.length * yahooVal.length);
    return onlyOneFilled;
  };

  const onSubmit = async (data) => {
    const leagueIdInput = data.leagueId;

    const re = leagueIdInput.match(/\d+$/);
    if (!re) {
      setResponseMsg('Invalid league id');
      return;
    }

    const newLeagueId = re[0];

    if (newLeagueId === '00000001') {
      props.setShow(false);
      props.setLeagueKey([newLeagueId, defaultLeagueYear]);
      return;
    }

    const leagueAuthCode = data.cookieEspnS2 || data.yahooAuthCode || '';
    const platform = data.cookieEspnS2
      ? 'espn'
      : data.yahooAuthCode
      ? 'yahoo'
      : '';

    const reqPayload = {
      leagueId: newLeagueId,
      platform: platform,
      leagueAuthCode: leagueAuthCode,
    };

    setResponseMsg(requestingMsg);

    const [leagueStatus, resLeagueId, resLeagueYear] = await requestLeagueId(
      reqPayload
    );
    const activeLeagueId = resLeagueId || newLeagueId;
    const activeLeagueYear = resLeagueYear || defaultLeagueYear;
    console.log(leagueStatus, activeLeagueId);

    switch (leagueStatus) {
      case 'ACTIVE':
        localStorage.setItem('leagueId', activeLeagueId);
        props.setShow(false);
        props.setLeagueKey([activeLeagueId, activeLeagueYear]);
        break;
      case 'SERVER_ERROR':
        setResponseMsg('Server issue, please try again later');
        break;
      case 'AUTH_LEAGUE_NOT_VISIBLE':
        setResponseMsg('League is private, enter in cookie information.');
        break;
      case 'GENERAL_NOT_FOUND':
        setResponseMsg('League id deleted, or missing authorization');
        break;
      case 'LEAGUE_NOT_FOUND_DELETED':
        setResponseMsg('League id deleted.');
        break;
      case 'invalid_grant':
        setResponseMsg('Error auth, redo authorization and auth code');
        break;
      case 'INVALID_AUTHORIZATION_CODE':
        setResponseMsg('Error auth, redo authorization and auth code');
        break;
      case 'AMBIGUOUS':
        setResponseMsg(`Enter ${newLeagueId}e or ${newLeagueId}y`);
        break;
      default:
        setResponseMsg('Error obtaining league information.');
    }
  };

  const description = `View or process league info, allow a few minutes
    for large historic leagues.
    Private ESPN leagues will require cookie information. 
    Yahoo leagues will require authorization. Cookie/Auth only 
    needs to be provided once unless errors present.`;

  const cookieInfoLink =
    'https://chrome.google.com/webstore/detail/espn-cookie-finder/oapfffhnckhffnpiophbcmjnpomjkfcj';
  const yahooAuthLink =
    'https://api.login.yahoo.com/oauth2/request_auth?client_id=dj0yJmk9Y0NLbVduVG0wTFdBJmQ9WVdrOWJYVkJSbG8wYTNjbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTYz&redirect_uri=oob&response_type=code&language=en-us';

  return ReactDOM.createPortal(
    <>
      <Modal>
        <Header>View/Process League Id</Header>
        <Text>{description}</Text>
        <URLExample>
          https://fantasy.espn.com/basketball/league?leagueId=
          <Underline>123456789</Underline>
        </URLExample>
        <URLExample>
          https://basketball.fantasysports.yahoo.com/f1/
          <Underline>123456</Underline>
        </URLExample>
        <LeagueForm onSubmit={handleSubmit(onSubmit)}>
          <LabelInput>
            <label>League Id</label>
            <input
              type='text'
              name='leagueId'
              placeholder='123456789'
              ref={register({ required: true })}
              disabled={formState.isSubmitting}
            />
          </LabelInput>
          <PlatformContainer>
            <Platform>
              <h3>ESPN</h3>
              <p>Chrome Extension</p>
              <InfoLink
                target='_blank'
                rel='noopener noreferrer'
                href={cookieInfoLink}
              >
                ESPN Cookie Finder
              </InfoLink>
              <LabelInput>
                <label>ESPN_S2 Cookie</label>
                <input
                  type='text'
                  name='cookieEspnS2'
                  placeholder='AEA1B2C3D4E5F6G7H8I9J10.........'
                  ref={register({ validate: isOnlyOnePlatform })}
                  disabled={formState.isSubmitting}
                />
              </LabelInput>
            </Platform>
            <Border />
            <Platform>
              <h3>Yahoo</h3>
              <p>Yahoo.com Authorization</p>
              {formState.isSubmitting ? (
                <InfoLink
                  onClick={(e) => e.preventDefault()}
                  href=''
                >
                  Authorize
                </InfoLink>
              ) : (
                <InfoLink
                  target='_blank'
                  rel='noopener noreferrer'
                  href={yahooAuthLink}
                >
                  Authorize
                </InfoLink>
              )}
              <LabelInput>
                <label>Auth Code</label>
                <input
                  type='text'
                  name='yahooAuthCode'
                  placeholder='1a2b3c4'
                  ref={register({ validate: isOnlyOnePlatform })}
                  disabled={formState.isSubmitting}
                />
              </LabelInput>
            </Platform>
          </PlatformContainer>
          <SubmitButton
            type='submit'
            value='Submit'
            disabled={formState.isSubmitting}
          />
          {errors.leagueId && <ErrorMsg>League Id Field Required</ErrorMsg>}
          {errors.cookieEspnS2 && errors.yahooAuthCode && (
            <ErrorMsg>Fill Only One Platform</ErrorMsg>
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
  max-height: 480px;
  width: 600px;
  max-width: 95%;
  background-color: black;
  border: 2px white solid;

  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 450px) {
    height: 600px;
  }
`;

const Header = styled.h1`
  text-align: center;
  margin-top: 1rem;
`;

const LeagueForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
`;

const Text = styled.p`
  text-align: center;
  max-width: 85%;
  margin: 1rem auto;
`;

const URLExample = styled.p`
  text-align: center;
  font-size: 14px;
`;

const PlatformContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;

  width: 100%;
  margin: 0.5rem auto;
`;

const Platform = styled.div`
  display: flex;
  flex-direction: column;

  width: 225px;
  max-width: 225px;

  h3 {
    align-self: center;
  }
`;

const InfoLink = styled.a`
  color: white;
  border: 2px white solid;
  text-decoration: none;

  margin: 4px auto;
  padding: 3px 5px;

  :hover {
    background-color: gray;
  }
`;

const Border = styled.div`
  width: 2px;
  background-color: white;
`;

const Underline = styled.span`
  text-decoration: underline;
`;

const LabelInput = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 13px;
    font-weight: bold;
    margin: 0.3rem 0 0.1rem 0;
  }
`;

const SubmitButton = styled.input`
  margin: 0.3rem auto 0 auto;
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
