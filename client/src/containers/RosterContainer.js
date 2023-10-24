import React, { useState } from 'react';
import styled from 'styled-components';


function RosterContainer(props) {
  const [period, setPeriod] = useState('Last15');
  const [displayList, setDisplayList] = useState([])

  const players = props.players;
  const teams = props.teams;
  const catIds = props.settings[0].categoryIds;

  const periodArray = ['Last7', 'Last15', 'Last30', 'Season'];
  const ratingsKey = `statRatings${period}`;


  return (
    <p></p>
  )
}

export default RosterContainer;