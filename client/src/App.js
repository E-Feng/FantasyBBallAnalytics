import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Home from './pages/Home';
import TeamStats from './pages/TeamStats';
import Compare from './pages/Compare';
import DraftRecap from './pages/DraftRecap';
import SeasonContext from './components/SeasonContext';
import { fetchFirebase, fetchDynamo } from './utils/webAPI';

const maxWidth = 1200;

const defaultLeagueId = '00000001';
const defaultLeagueYear = '2021';

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

const fetchAllData = (leagueKey) => {
  function setLeagueQueryData(leagueData) {
    const dataGroups = ['teams', 'scoreboard', 'draftRecap'];
    queryClient.setQueryData(leagueKey, true);
  
    dataGroups.forEach(group => {  
      queryClient.setQueryData(group, leagueData[group])
    })
  }

  const status = queryClient.getQueryState(leagueKey);

  if (status === undefined) {
    const leagueData = fetchDynamo(leagueKey, setLeagueQueryData);
  }

  // const data = ['messageboard', 'teams', 'scoreboard', 'draftrecap'];

  // data.forEach((name) => {
  //   let queryKey = [leagueId, leagueId];
  //   if (name === 'messageboard') {
  //     queryKey = [name];
  //   }

  //   const status = queryClient.getQueryState(queryKey);
  //   if (status === undefined) {
  //     queryClient.prefetchQuery(queryKey, fetchFirebase);
  //   }
  // });
};

function App() {
  console.log('Rendering app...');
  const [leagueId, setLeagueId] = useState(defaultLeagueId);
  const [leagueYear, setLeagueYear] = useState(defaultLeagueYear);
  const value = { leagueYear, setLeagueYear };

  fetchAllData([leagueId, leagueYear]);

  return (
    <SeasonContext.Provider value={value}>
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
    </SeasonContext.Provider>
  );
}

export default App;
