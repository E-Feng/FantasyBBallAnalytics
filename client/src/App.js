import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Home from './pages/Home';
import TeamStats from './pages/TeamStats';
import Compare from './pages/Compare';
import DraftRecap from './pages/DraftRecap';
import LeagueContext from './components/LeagueContext';
import { fetchDynamo, fetchFirebase } from './utils/webAPI';

const maxWidth = 1200;

const defaultLeagueId = '48375511';
const defaultLeagueYear = '2022';

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
  const leagueYear = leagueKey[1]

  const status = queryClient.getQueryState(leagueKey);

  if (status === undefined) {
    try {
      queryClient.prefetchQuery(leagueKey, fetchDynamo);
      queryClient.prefetchQuery([leagueYear, 'common'], fetchFirebase);
    } catch (e) {
      console.log(e);
    }
  }
};

function App() {
  console.log('Rendering app...');
  const [leagueId, setLeagueId] = useState(defaultLeagueId);
  const [leagueYear, setLeagueYear] = useState(defaultLeagueYear);

  const leagueKey = [leagueId, leagueYear];
  const contextValue = {
    leagueKey: [leagueId, leagueYear],
    setters: [setLeagueId, setLeagueYear],
  };

  fetchAllData(leagueKey);

  return (
    <LeagueContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        <Router>
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
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </LeagueContext.Provider>
  );
}

export default App;
