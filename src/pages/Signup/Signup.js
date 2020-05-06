import React, { Component } from 'react';
import './Signup.css';
import {
    FormGroup,
    FormControl,
    HelpBlock,  
    Button,
    Alert,
} from 'react-bootstrap';
import 'whatwg-fetch';
import { RESTAPIUrl } from '../../config/config';

class SignUp extends Component {
    
    constructor(props, context) {
    super(props, context);

    this.handleChange = this.handleChange.bind(this);
    
    this.handleChangeEmail = this.handleChangeEmail.bind(this);
        
    this.handleChangeConfirm = this.handleChangeConfirm.bind(this);
        
    this.handleChangeName = this.handleChangeName.bind(this);
        
    this.handleDismiss = this.handleDismiss.bind(this);
        
    this.handleShow = this.handleShow.bind(this);
        
        
    this.signUpClicked = this.signUpClicked.bind(this);
        
    this.displayAlert = this.displayAlert.bind(this);

    this.state = {
      password: '',
      email: '',
      confPass: '',
      name: '',
      signInLoading: false,
      show: false,
      signupStatus: 'success',
      signUpMessage: 'You have signed up successfully. Proceed to login.',
        
    };
  }
    
  validateEmail() {
    if(this.state.email.length ===0) return null;
      // eslint-disable-next-line
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(this.state.email).toLowerCase())?'success':'error';
  }

  getValidationState() {
    const length = this.state.password.length;
    if (length > 8) return 'success';
    else if (length > 5) return 'warning';
    else if (length > 0) return 'error';
    return null;
  }
    
  getValidationStateConf() {
    const length = this.state.confPass.length;
    if(length === 0 ) return null;
      
    else if( this.state.password === this.state.confPass ) return 'success';
    
    else return 'error';
      
    
  }

  handleChange(e) {
    this.setState({ password: e.target.value });
  }
    
  handleChangeEmail(e) {
    this.setState({ email: e.target.value });
  }

  handleChangeConfirm(e) {
    this.setState({ confPass: e.target.value });
  }

  handleChangeName(e) {
    this.setState({ name: e.target.value });
  }
    
  handleDismiss() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }
    
  displayAlert() {
      return (
          <Alert bsStyle={this.state.signupStatus} onDismiss={this.handleDismiss} id="alertBox">
              
              <p>
                { this.state.signUpMessage }
              </p>
              
            </Alert>

      );
  }

    
  signUpClicked(e) {
      this.setState({ signInLoading : true });
      //console.log(e);
      const newUser = {
        password: this.state.password,
        name: this.state.name,
        email: this.state.email,
      };
      
      fetch( RESTAPIUrl+"/api/account/signup", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser),
        })
        .then(res => res.json())
        .then(json => {
            console.log('json', json);
        
        if(json.message === "Signed Up") {
            this.setState({
                signInLoading: false,
                show: true,
                signupStatus: 'success',
                signUpMessage: 'You have signed up successfully. Proceed to login.',
                name: '',
                password: '',
                confPass: '',
                email: '',
                
            });
        } else if ( json.message === 'Error: Account Already Exists') {
            this.setState({
                signInLoading: false,
                show: true,
                signupStatus: 'warning',
                signUpMessage: 'Account already Exists. Procced to login',  
                name: '',
                password: '',
                confPass: '',
                email: '',
            });
        } else if( json.message === 'Error: Server Error') {
            this.setState({
                signInLoading: false,
                show: true,
                signupStatus: 'danger',
                signUpMessage: 'Unexpected error. Please try again later.',
                name: '',
                password: '',
                confPass: '',
                email: '',
                
            });
        }
        
            
        })
      
  }

    
  
    
    render() {
        return (
            <div>
              <form>
                <FormGroup
                    controlId="signUpName">
                    <FormControl
                        type="text"
                        value={this.state.name}
                        placeholder="Name"
                        onChange={this.handleChangeName}

                        />

                    </FormGroup>


                <FormGroup
                    controlId="signUpEmail"
                    validationState={this.validateEmail()}
                    >

                    <FormControl
                        type="email"
                        value={this.state.email}
                        placeholder="Email"
                        onChange={this.handleChangeEmail}
                        />
                    <FormControl.Feedback />    

                </FormGroup>    


                <FormGroup
                  controlId="formBasicTextSignupPass"
                  validationState={this.getValidationState()}
                >

                  <FormControl
                    type="password"
                    value={this.state.password}
                    placeholder="Password"
                    onChange={this.handleChange}
                  />
                  <FormControl.Feedback />
                  <HelpBlock id="passwordHelp">Password must be minimum 8 characters long</HelpBlock>
                </FormGroup>

                <FormGroup
                  controlId="formBasicTextSignupConfPass"
                  validationState={this.getValidationStateConf()}
                >

                  <FormControl
                    type="password"
                    value={this.state.confPass}
                    placeholder="Confirm Password"
                    onChange={this.handleChangeConfirm}
                  />
                  <FormControl.Feedback />

                </FormGroup>

                <Button
                  block
                  bsStyle="warning"
                  disabled = {this.state.signInLoading}
                  onClick = {this.state.signInLoading ? null : this.signUpClicked}
                  >
                    {this.state.signInLoading ? 'Processing...' : 'Sign Up'}
              </Button>


              </form>
                
              { this.state.show ? this.displayAlert() : null}


              
        </div>
          
        );
        
    }
}

export default SignUp;

