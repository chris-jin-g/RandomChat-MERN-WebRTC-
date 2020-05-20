import React from 'react';
import { MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBModalFooter, MDBInputSelect } from 'mdbreact';
import 'whatwg-fetch';
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import { setInStorage } from '../../utils/storage';
import { RESTAPIUrl } from '../../config/config';
import { countries } from "../../config/country";
import './GuestSign.css';

class GuestSign extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangeLocation = this.handleChangeLocation.bind(this);
    this.handleChangeAge = this.handleChangeAge.bind(this);
    this.handleChangeGender = this.handleChangeGender.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      userName: '',
      location: 'Canada',
      age: 28,
      gender: 'Male',
      loginLoading: false,
    }
  }

  handleChangeName(e) {
    this.setState({ userName: e.target.value });
  }

  handleChangeLocation(e) {
    this.setState({ location: e.target.value });
  }

  handleChangeAge(value) {
    this.setState({ age: value });
  }

  handleChangeGender(e) {
    this.setState({ gender: e.target.value });
  }
  
  handleSubmit(event) {
    event.preventDefault();
    const { userName, location, age, gender } = this.state;
    
    this.setState ({ 
      loginLoading: true, 
    });

    fetch(RESTAPIUrl + '/api/guest/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName,
        location,
        age,
        gender
      }),
    }).then(res =>res.json())
      .then(json => {
        if(json.status) {
          setInStorage('guest_signin', {token:json.token});
          this.props.history.push("/chat");
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
            <form onSubmit={this.handleSubmit}>
              <MDBCard>
              <div className="text-center sign-title">
                <h5 className="dark-grey-text mb-5"><strong>Sign in</strong></h5>
              </div>
              <MDBCardBody className="mx-4">
                
                <MDBInput label="Your Name" group type="text" onChange={this.handleChangeName} validate error="wrong" success="right" required/>
                
                <select className="browser-default custom-select" id="location" name="location" value={this.state.location} onChange={this.handleChangeLocation} >
                  <option>Choose your location</option>
                  {
                    countries.map((object, i) => {
                      return <option value={object} key={i}>{object}</option>
                    })
                  }
                </select>

                <label className="form-label" >Your Age</label>
                <MDBInputSelect  id="age" name="age" getValue={this.handleChangeAge} min={13} max={99} value={this.state.age} className='mb-2' />
                
                <label className="form-label">Your Gender</label>
                <div className="radio-group">
                  <div className="radio">
                    <input id="radio-1" name="radio" type="radio" value="Male" onChange={this.handleChangeGender} checked={this.state.gender === 'Male'} />
                    <label htmlFor="radio-1" className="radio-label">Male</label>
                  </div>

                  <div className="radio">
                    <input id="radio-2" name="radio" type="radio" value="Female" onChange={this.handleChangeGender} checked={this.state.gender === 'Female'} />
                    <label  htmlFor="radio-2" className="radio-label">Female</label>
                  </div>  
                </div>

                <div className="text-center pt-3 mb-3">
                  <MDBBtn 
                    type="submit" 
                    className="btn-block z-depth-1a" 
                    outline color="info"
                    >
                      {this.state.logInLoading ? 'Authenticating...' : 'Start Chat'}
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

export default GuestSign;