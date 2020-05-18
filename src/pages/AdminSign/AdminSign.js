import React from 'react';
import { MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBModalFooter } from 'mdbreact';
import 'whatwg-fetch';
import {
    NotificationContainer,
    NotificationManager
  } from "react-notifications";
  import "react-notifications/lib/notifications.css";

import { RESTAPIUrl } from '../../config/config';
import './AdminSign.css';

class AdminSign extends React.Component {
  constructor(props) {
    super(props);    

    this.state = {
        email: '' ,
        password: '',
        adminSignLoading: false
    }
  }

  handleChangeEmail(e) {
    console.log("email change", this.state.email)
    this.setState({ email: e.target.value });
  }

  handleChangePassword(e) {
      this.setState({ password: e.target.value });
  }

  
  handleSubmit(event) {
    event.preventDefault();
    const { email, password } = this.state;
    
    this.setState ({ 
      adminSignLoading: true, 
    });

    fetch(RESTAPIUrl + '/api/admin/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      }),
    }).then(res =>res.json())
      .then(json => {
        console.log('this is json object', json);
        if(json.success) {
          this.props.history.push("/admin/manage");
        } else {
            NotificationManager.error(
                `${json.message}`
            );
        }
      })
  }
  render() {
    return (
        <MDBRow>
            <NotificationContainer />  
          <MDBCol sm="10" md="7" lg="6" xl="4" className="mx-auto mt-3 sign-container">
            <form onSubmit={this.handleSubmit.bind(this)}>
              <MDBCard>
              <div className="text-center sign-title">
                <h5 className="dark-grey-text mb-5"><strong> Adminiatrator Sign in</strong></h5>
              </div>
              <MDBCardBody className="mx-4">
                
                <MDBInput label="Your Email" group type="email" onChange={this.handleChangeEmail.bind(this)} validate error="wrong" success="right" required/>

                <MDBInput group type="password" onChange={this.handleChangePassword.bind(this)} validate error="wrong" success="right" required/>

                <div className="text-center pt-3 mb-3">
                  <MDBBtn 
                    type="submit" 
                    className="btn-block z-depth-1a"
                    outline color="info"
                    >
                      {this.state.logInLoading ? 'Authenticating...' : 'SignIn'}
                  </MDBBtn>
                </div>

              </MDBCardBody>
              <MDBModalFooter className="mx-5 pt-3 mb-1">
                
              </MDBModalFooter>
            </MDBCard>
            </form>
          </MDBCol>
        </MDBRow>
    );  
  }
}

export default AdminSign;