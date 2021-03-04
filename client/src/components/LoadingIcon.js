import React from 'react';

import styled, { keyframes } from 'styled-components';

function LoadingIcon() {
  return (
    <Container>
      <Spinner>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </Spinner>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  flex-grow: 1;
`

const opacity = keyframes`
  from {
    opacity: 0
  }

  to {
    opacity: 1
  }
`;

const Spinner = styled.div`
  color: official;
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;

  div {
    transform-origin: 40px 40px;
    animation: ${opacity} 1.2s linear infinite;
  }

  div:after {
    content: ' ';
    display: block;
    position: absolute;
    top: 3px;
    left: 37px;
    width: 6px;
    height: 18px;
    border-radius: 20%;
    background: #fff;
  }

  div:nth-child(1) {
    transform: rotate(0deg);
    animation-delay: -1.1s;
  }

  div:nth-child(2) {
    transform: rotate(30deg);
    animation-delay: -1s;
  }

  div:nth-child(3) {
    transform: rotate(60deg);
    animation-delay: -0.9s;
  }

  div:nth-child(4) {
    transform: rotate(90deg);
    animation-delay: -0.8s;
  }

  div:nth-child(5) {
    transform: rotate(120deg);
    animation-delay: -0.7s;
  }

  div:nth-child(6) {
    transform: rotate(150deg);
    animation-delay: -0.6s;
  }

  div:nth-child(7) {
    transform: rotate(180deg);
    animation-delay: -0.5s;
  }

  div:nth-child(8) {
    transform: rotate(210deg);
    animation-delay: -0.4s;
  }

  div:nth-child(9) {
    transform: rotate(240deg);
    animation-delay: -0.3s;
  }

  div:nth-child(10) {
    transform: rotate(270deg);
    animation-delay: -0.2s;
  }

  div:nth-child(11) {
    transform: rotate(300deg);
    animation-delay: -0.1s;
  }

  div:nth-child(12) {
    transform: rotate(330deg);
    animation-delay: 0s;
  }
`;

export default LoadingIcon;
