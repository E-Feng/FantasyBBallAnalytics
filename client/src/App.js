import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Home from './pages/Home';
import TeamStats from './pages/TeamStats';
import DraftRecap from './pages/DraftRecap';
import { fetchFirebase } from './utils/webAPI';

const maxWidth = 1200;

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

const fetchAllData = () => {
  const data = ['teams', 'scoreboard', 'messageboard', 'draftrecap'];

  data.forEach(name => {
    queryClient.prefetchQuery(`${name}.json`, fetchFirebase);
  })  
};

function App() {
  fetchAllData();

  return (
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
            path='/draftrecap'
            render={(props) => <DraftRecap {...props} maxWidth={maxWidth} />}
          />
        </Switch>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
