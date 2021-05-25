import React from 'react';

const SeasonContext = React.createContext({
  seasonYear: '2021',
  setSeasonYear: () => {},
});

export default SeasonContext;
