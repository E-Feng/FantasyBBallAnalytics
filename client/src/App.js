import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Home from './pages/Home';
import TeamStats from './pages/TeamStats';
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
  queryClient.prefetchQuery('team.json', fetchFirebase);
  queryClient.prefetchQuery('scoreboard.json', fetchFirebase);
  queryClient.prefetchQuery('messageboard.json', fetchFirebase);
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
        </Switch>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
