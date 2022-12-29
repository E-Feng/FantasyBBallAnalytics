import React, { useContext } from 'react';
import { useQueryClient, useIsFetching } from 'react-query';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import LeagueContext from '../components/LeagueContext';
import LoadingIcon from './LoadingIcon';
import { hasProfanity } from '../utils/chatUtil';

function MessageBoard() {
  const { leagueKey } = useContext(LeagueContext);
  const leagueYear = leagueKey[1];

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData([leagueYear, 'common']);

  const isDataLoaded = data !== undefined;
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded || isFetching;

  const messageData = isLoading ? null : data.messageboard;

  const messageArray = [];

  const { register, handleSubmit, reset, errors } = useForm();

  const onSubmit = async (data) => {
    const name = data.name;
    const msg = data.msg;

    // Sanitizing inputs
    const isProfanity = (await hasProfanity(name)) || (await hasProfanity(msg));
    const isReserved = ['BOT', 'ADMIN'].includes(name.toUpperCase());

    if (isProfanity || isReserved) {
      return;
    }

    const tzOffset = new Date().getTimezoneOffset() * 60000;

    const dateString = new Date(Date.now() - tzOffset).toISOString();
    const date = dateString.slice(0, 10);
    const time = dateString.slice(11).replace('.', '-');

    const payload = {
      user: name,
      msg: msg,
      date: date,
      time: time,
      type: 'chat',
    };

    // Updating messageData
    messageData[date] = messageData[date] ? messageData[date] : [];

    messageData[date][time] = payload;

    reset({ name: name, msg: '' });

    // Sending request to server
    const pre =
      process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';

    fetch(pre + '/api/chat/', {
      method: 'put',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then((res) => {
      console.log('Post status ', res.status);

      return res.status;
    });
  };

  const formatMessage = (msg) => {
    let content;
    switch (msg.type) {
      case 'stat':
        // Formatting statlines
        const mainStats = `${msg.pts}/${msg.rebs}/${msg.asts}/${msg.stls}/${msg.blks}/${msg.tos}`;
        const shootingStats = `(${msg.fgMade}/${msg.fgAtt},
                                  ${msg.threes}/${msg.threesAtt},   
                                  ${msg.ftMade}/${msg.ftAtt})`;
        content = `${msg.fullName} with ${mainStats} on ${shootingStats} shooting in ${msg.mins} minutes`;
        break;
      case 'date':
        // Formatting new date break lines
        const options = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        const split = msg.date.split('-');
        const date = new Date(split[0], split[1] - 1, split[2]);

        const formattedDate = date.toLocaleDateString('en-US', options);

        return (
          <li key={msg.date}>
            <DateHeader>{formattedDate}</DateHeader>
          </li>
        );
      case 'ejection':
        // Formatting ejections
        content = `${msg.fullName} has been ejected!`;
        break;
      default:
        content = msg.msg;
    }
    return (
      <li key={msg.time}>
        <b>{msg.user}: </b>
        {content}
      </li>
    );
  };

  if (!isLoading) {
    // Formatting chat messages from json data
    Object.keys(messageData).forEach((date) => {
      messageArray.push({ type: 'date', date: date });

      const unsortedMessages = [];
      Object.keys(messageData[date]).forEach((key) => {
        unsortedMessages.push(messageData[date][key]);
      });

      // Sort by time and re-add to message array
      unsortedMessages.sort((a, b) => (b.time > a.time ? -1 : 1));
      unsortedMessages.forEach((o) => messageArray.push(o));
    });
  }

  return (
    <Container>
      <ScrollWrapper>
        {isLoading ? (
          <LoadingIcon></LoadingIcon>
        ) : (
          <Messages>
            {messageArray.map((msg) => {
              const formatted = formatMessage(msg);
              return formatted;
            })}
          </Messages>
        )}
      </ScrollWrapper>
      <ChatForm onSubmit={handleSubmit(onSubmit)}>
        <label>Name:</label>
        <Name
          type='text'
          name='name'
          placeholder='Enter name'
          ref={register({ required: true })}
        />
        <Textbox
          type='text'
          name='msg'
          placeholder='Type your message here'
          ref={register({ required: true })}
        />
        <input type='submit' value='SEND' />
      </ChatForm>
      {(errors.name || errors.msg) && <p>Field Required</p>}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: calc(100% - 2px);
  max-width: 800px;
  margin: 0.75rem 0.5rem;
  border: 1px solid white;
`;

const ScrollWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;

  min-height: 600px;
  max-height: 600px;
  overflow: auto;
`;

const Messages = styled.ul`
  display: flex;
  flex-direction: column;

  color: black;
  background-color: gainsboro;
  padding: 0;

  list-style-type: none;

  li {
    padding: 0.1rem 0.25rem;
  }

  li:nth-child(odd) {
    background-color: silver;
  }
`;

const DateHeader = styled.p`
  text-align: center;
  font-size: 14px;
  text-transform: uppercase;

  background-color: gray;
`;

const ChatForm = styled.form`
  display: flex;
  flex-direction: row;

  label {
    padding: 0 0.25rem;
  }

  input {
    width: 60px;
  }
`;

const Name = styled.input`
  flex: 1;
`;

const Textbox = styled.input`
  flex: 4;
`;

export default MessageBoard;
