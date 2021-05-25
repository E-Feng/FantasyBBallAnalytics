import React from 'react';
import { Link } from 'react-router-dom';
import {FaGithub, FaLinkedin, FaInstagram, FaHome} from 'react-icons/fa';

import SeasonDropdown from './SeasonDropdown';

import styled from 'styled-components';

function NavBar(props) {
  return (
    <NavContainer maxWidth={props.maxWidth}>
      <LinksContainer>
        <LinksList>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <Link to='/teamstats'>Team Stats</Link>
          </li>
          <li>
            <Link to='/draftrecap'>Draft Recap</Link>
          </li>
        </LinksList>
      </LinksContainer>
      <Filler />
      <SeasonDropdown />
      <Icons>
        <li>
          <a href='https://elvinfeng.com/'>
            <FaHome title='Main'></FaHome>
          </a>
        </li>
        <li>
          <a href='https://github.com/E-Feng/FantasyBBallAnalytics'>
            <FaGithub title='Github'></FaGithub>
          </a>
        </li>
        <li>
          <a href='https://www.linkedin.com/in/elvin-feng-527b8b81/'>
            <FaLinkedin title='Linkedin'></FaLinkedin>
          </a>
        </li>
        <li>
          <a href='https://www.instagram.com/ig.elvin/?hl=en'>
            <FaInstagram title='Instagram'></FaInstagram>
          </a>
        </li>
      </Icons>
    </NavContainer>
  );
}

const NavContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  max-width: ${(props) => props.maxWidth}px;
  margin: 0 auto;
  padding: 0.75rem 0;

  ul {
    list-style: none;
    padding: 0;
    margin: 0.25rem 0.5rem;
  }

  @media (max-width: 450px) {
    flex-direction: column;
    align-items: center;
    padding: 0.25rem 0;
  }
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: column;

  ul li a {
    position: relative;
    margin: 0 0.5rem;
    text-decoration: none;
    text-transform: uppercase;
    color: #ffffff;

    :after,
    :visited:after {
      position: absolute;
      content: '';
      width: 0%;
      height: 2px;
      background: #ffffff;
      bottom: 0;
      left: 0;
      margin-bottom: -4px;
      transition: 0.2s;
    }

    :hover:after,
    :visited:hover:after {
      width: 100%;
    }
  }

  @media (max-width: 450px) {
    li a {
      margin: 0 0.4rem;
      font-size: min(20px, 5vw);
    }
  }
`;

const LinksList = styled.ul`
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;

  font-size: 20px;
`;

const Filler = styled.div`
  flex-grow: 2;
`;

const Icons = styled.ul`
  flex-grow: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;

  li {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 0.5em;

    a {
      font-size: 24px;
      color: #fff;
    }
  }

  @media (max-width: 450px) {
    li {
      padding: 0 0.3em;

      a {
        font-size: min(24px, 5vw);
      }
    }
  }
`;

export default NavBar;
