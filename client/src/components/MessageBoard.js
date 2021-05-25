import React from 'react';
import { useQueryClient, useIsFetching } from 'react-query';
import { useForm } from 'react-hook-form';

import LoadingIcon from './LoadingIcon';

import styled from 'styled-components';

function MessageBoard() {
  const queryClient = useQueryClient();
  const messageData = queryClient.getQueryData(['messageboard']);

  const isDataLoaded = messageData !== undefined;
  const isFetching = useIsFetching() > 0;

  const isLoading = !isDataLoaded && isFetching;

  const messageArray = [];

  const { register, handleSubmit, reset, errors } = useForm();

  const onSubmit = (data) => {
    reset({ name: data.name });

    const tzOffset = new Date().getTimezoneOffset() * 60000;

    const dateString = new Date(Date.now() - tzOffset).toISOString();
    const date = dateString.slice(0, 10);
    const time = dateString.slice(11).replace('.', '-');

    const payload = {
      user: data.name,
      msg: data.msg,
      date: date,
      time: time,
      type: 'chat',
    };

    // Return error if username is same as reserved BOT
    if (data.name === 'BOT') {
      return;
    }

    // Updating messageData
    messageData[date] = messageData[date] ? messageData[date] : [];

    messageData[date][time] = payload;
    queryClient.setQueryData('messageboard.json', messageData);

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
        content = `${msg.name} [${msg.abbrev}] with ${mainStats} on ${shootingStats} shooting in ${msg.mins} minutes`;
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
        content = `${msg.name} [${msg.abbrev}] has been ejected!`;
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
      Object.keys(messageData[date]).forEach((key) => {
        messageArray.push(messageData[date][key]);
      });
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
