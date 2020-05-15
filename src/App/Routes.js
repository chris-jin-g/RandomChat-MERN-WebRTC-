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
    
    // fetch(RESTAPIUrl + '/api/guest/signin', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     userName,
    //     location,
    //     age,
    //     gender
    //   }),
    // }).then(res =>res.json())
    //   .then(json => {
    //     console.log('this is json object', json);
    //     if(json.status) {
    //       setInStorage('guest_signin', {token:json.token});
    //       this.props.history.push("/chat");
    //     } else {
    //       alert("Server Error");
    //     }
    //   })

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
      </Switch>
    );
  }
}

export default Routes;
