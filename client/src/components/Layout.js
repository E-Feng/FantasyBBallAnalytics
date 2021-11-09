import React from 'react';
import NavBar from './NavBar';

import styled from 'styled-components';

function Layout(props) {
  return (
    <Container>
      <NavBar maxWidth={props.maxWidth} isError={props.isError}/>
      <Border />
      <Children >{props.children}</Children>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
`;

const Border = styled.div`
  min-height: 2px;
  height: 2px;
  width: 100%;
  margin: 0;
  background: #fff;
`;

const Children = styled.div`
  flex-grow: 1;
  width: 100%;
`;

export default Layout;
