import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { getFromStorage } from '../utils/storage';

// FREE
import HomePage from '../pages/HomePage/HomePage';
import UserSign from '../pages/UserSign/UserSign';
import GuestSign from '../pages/GuestSign/GuestSign';
import Chat from '../pages/Chat/Chat';

import AdminSign from '../pages/AdminSign/AdminSign';
import AdminManage from '../pages/AdminManage/AdminManage';

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
      ? <Redirect to='/chat' /> 
      : <Component {...props} />
  )} />
)

const PrivateChatRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    fakeAuth()  
      ? <Component {...props} />
      : <Redirect to='/' /> 
  )} />
)

class Routes extends React.Component {
  
  render() {
    return (
      <Switch>
        <PrivateRoute exact path="/" component={HomePage} />
        <PrivateRoute path="/usersign" component={ UserSign } />
        <PrivateRoute path="/guest" component={ GuestSign } />
        <PrivateChatRoute path="/chat" component={ Chat } />
        <Route exact path="/admin" component={ AdminSign } />
        <Route path="/admin/manage" component= { AdminManage } />
      </Switch>
    );
  }
}

export default Routes;
