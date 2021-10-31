import React, { useState } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Home from './pages/Home';
import TeamStats from './pages/TeamStats';
import Compare from './pages/Compare';
import DraftRecap from './pages/DraftRecap';
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

const fetchAllData = async (leagueKey) => {
  const leagueYear = leagueKey[1];

  const statusLeagueKey = queryClient.getQueryState(leagueKey);
  const statusCommon = queryClient.getQueryState([leagueYear, 'common']);

  if (statusLeagueKey === undefined) {
    try {
      queryClient.prefetchQuery(leagueKey, fetchDynamo);
    } catch (e) {
      console.log(e);
    }
  }

  if (statusCommon === undefined) {
    try {
      queryClient.prefetchQuery([leagueYear, 'common'], fetchFirebase);
    } catch (e) {
      console.log(e);
    }
  }
};

function App() {
  console.log('Rendering app...');
  const leagueParam = new URLSearchParams(useLocation().search).get('league');
  defaultLeagueId = leagueParam || defaultLeagueId;
  defaultLeagueYear = leagueParam ? '2022' : defaultLeagueYear;

  const [leagueId, setLeagueId] = useState(defaultLeagueId);
  const [leagueYear, setLeagueYear] = useState(defaultLeagueYear);

  console.log(leagueId);

  const leagueKey = [leagueId, leagueYear];
  const contextValue = {
    leagueKey: [leagueId, leagueYear],
    setters: [setLeagueId, setLeagueYear],
  };

  fetchAllData(leagueKey);

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
        </Switch>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </LeagueContext.Provider>
  );
}

export default App;
