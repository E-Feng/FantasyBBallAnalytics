import React, { useState } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Home from './pages/Home';
import TeamStats from './pages/TeamStats';
import Compare from './pages/Compare';
import DraftRecap from './pages/DraftRecap';
import Error from './pages/Error';
import LeagueContext from './components/LeagueContext';
import { fetchDynamo, fetchFirebase } from './utils/webAPI';

const maxWidth = 1200;

let defaultLeagueId = '00000001';
let defaultLeagueYear = '2021';

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
        setLeagueAvail(false);
      }
    }
  };

  console.log('Rendering app...');
  // Determining league id using URL params and localstorage
  let initialLeagueId;

  const paramId = new URLSearchParams(useLocation().search).get('league');

  if (paramId) {
    localStorage.setItem('leagueId', paramId);
    initialLeagueId = paramId;
  } else {
    initialLeagueId = localStorage.getItem('leagueId');
  }

  defaultLeagueId = initialLeagueId || defaultLeagueId;
  defaultLeagueYear = initialLeagueId ? '2022' : defaultLeagueYear;

  const [leagueId, setLeagueId] = useState(defaultLeagueId);
  const [leagueYear, setLeagueYear] = useState(defaultLeagueYear);
  const [leagueAvailable, setLeagueAvail] = useState(true);

  const leagueKey = [leagueId, leagueYear];
  const contextValue = {
    leagueKey: [leagueId, leagueYear],
    setters: [setLeagueId, setLeagueYear],
  };

  if (leagueAvailable) {
    fetchAllData(leagueKey);
  } else {
    return <Error isLeagueError={true} maxWidth={maxWidth} />;
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
            path='/teamstats'
            render={(props) => <TeamStats {...props} maxWidth={maxWidth} />}
          />
          <Route
            path='/compare'
            render={(props) => <Compare {...props} maxWidth={maxWidth} />}
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
