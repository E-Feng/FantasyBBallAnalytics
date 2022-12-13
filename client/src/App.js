import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Home from './pages/Home';
import Teams from './pages/Teams';
import Scoreboard from './pages/Scoreboard';
import Compare from './pages/Compare';
import DraftRecap from './pages/DraftRecap';
import Error from './pages/Error';
import LeagueContext from './components/LeagueContext';
import { fetchDynamo, fetchFirebase } from './utils/webAPI';

const maxWidth = 1200;

const defaultLeagueId = '00000001';
const defaultLeagueYear = 2023;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      cacheTime: Infinity,
    },
  },
});

function App() {
  const fetchAllData = async (leagueKey) => {
    const leagueYear = leagueKey[1];

    const statusLeagueKey = queryClient.getQueryState(leagueKey);
    const statusCommon = queryClient.getQueryState([leagueYear, 'common']);

    if (statusLeagueKey === undefined || statusCommon === undefined) {
      const dataLeague = await queryClient.fetchQuery(leagueKey, fetchDynamo);
      const dataCommon = await queryClient.fetchQuery(
        [leagueYear, 'common'],
        fetchFirebase
      );

      if (dataLeague === null || dataCommon === null) {
        setLeagueId(defaultLeagueId);
      }
    }
  };

  console.log('Rendering app...');
  // Determining league id using URL params and localstorage
  let initialLeagueId;

  const paramId = new URLSearchParams(window.location.search).get('league');
  const storageId = localStorage.getItem('leagueId');

  initialLeagueId = paramId || storageId;

  if (initialLeagueId) {
    localStorage.setItem('leagueId', initialLeagueId);
  }

  const defaultShowModal = initialLeagueId ? false : true;

  const [leagueId, setLeagueId] = useState(initialLeagueId || defaultLeagueId);
  const [leagueYear, setLeagueYear] = useState(defaultLeagueYear);
  const [showLeagueModal, setShowLeagueModal] = useState(defaultShowModal);

  const leagueKey = [leagueId, leagueYear];
  const contextValue = {
    leagueKey: [leagueId, leagueYear],
    id: [leagueId, setLeagueId],
    year: [leagueYear, setLeagueYear],
    modal: [showLeagueModal, setShowLeagueModal],
  };

  const status = queryClient.getQueryState(leagueKey);
  if (status === undefined) {
    fetchAllData(leagueKey);
  }

  return (
    <LeagueContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route
            exact
            path='/'
            render={(props) => <Home {...props} maxWidth={maxWidth} />}
          />
          <Route
            path='/teams'
            render={(props) => <Teams {...props} maxWidth={maxWidth} />}
          />
          <Route
            path='/scoreboard'
            render={(props) => <Scoreboard {...props} maxWidth={maxWidth} />}
          />
          <Route
            path='/compare'
            render={(props) => <Compare {...props} maxWidth={maxWidth} />}
          />
          <Route
            path='/draft'
            render={(props) => <DraftRecap {...props} maxWidth={maxWidth} />}
          />
          <Route
            path='/draftrecap'
            render={(props) => <DraftRecap {...props} maxWidth={maxWidth} />}
          />
          <Route render={(props) => <Error {...props} maxWidth={maxWidth} />} />
        </Switch>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </LeagueContext.Provider>
  );
}

export default App;
