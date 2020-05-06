import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { getFromStorage } from '../utils/storage';

// FREE
import HomePage from '../pages/HomePage/HomePage';
import UserSign from '../pages/UserSign/UserSign';
import GuestSign from '../pages/GuestSign/GuestSign';
import Chat from '../pages/Chat/Chat';

const fakeAuth = () => {
  const obj = getFromStorage('guest_signin');
  
  if(obj && obj.token) {
    return true;
  }
  return false;
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    fakeAuth()
      ? <Component {...props} />
      : <Redirect to='/guesteeee' />
  )} />
)

class Routes extends React.Component {
  
  render() {
    return (
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/usersign" component={ UserSign } />
        <Route path="/guest" component={ GuestSign } />
        <PrivateRoute path="/chat" component={ Chat } />
      </Switch>
    );
  }
}

export default Routes;
