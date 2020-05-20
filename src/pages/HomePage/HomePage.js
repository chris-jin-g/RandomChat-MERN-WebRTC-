import React from 'react';
import { MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavbarToggler, MDBCollapse, MDBNavItem, MDBNavLink, MDBContainer, MDBMask, MDBView, MDBBtn, MDBIcon } from 'mdbreact';
import { RESTAPIUrl} from "../../config/config";
import './HomePage.css';

class FullPageIntroWithFixedTransparentNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: false,
      isWideEnough: false,
      restricted: false
    };
    this.onClick = this.onClick.bind(this);
  }
  
  componentDidMount() {
    this.verifyAccount();
  }

  verifyAccount() {    
    fetch(RESTAPIUrl + '/api/guest/ipverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      }),
    })
    .then(res =>res.json())
    .then(json => {
      if(!json.status) {
        this.setState({restricted: true});
      }else {
        this.setState({restricted: false});
      }
    })
  }

  onClick() {
    this.setState({
      collapse: !this.state.collapse,
    });
  }

  render() {
    return (
      <div>
        <header>
            
            <MDBNavbar color="bg-primary" fixed="top" dark expand="md" scrolling transparent>
              <MDBContainer size="md">            
                <MDBNavbarBrand href="/">
                  <strong className="navbar-title">Chat With Stranger</strong>
                </MDBNavbarBrand>
                {!this.state.isWideEnough && <MDBNavbarToggler onClick={this.onClick} />}
                <MDBCollapse isOpen={this.state.collapse} navbar>
                  <MDBNavbarNav right>
                    <MDBNavItem>
                      <MDBNavLink 
                        to="/guest"
                        disabled={this.state.restricted}
                      >
                        GUEST
                      </MDBNavLink>
                    </MDBNavItem>                   
                  </MDBNavbarNav>
                </MDBCollapse>
              </MDBContainer>
            </MDBNavbar>
            

          <MDBView src={process.env.PUBLIC_URL + '/background.jpg'}>
            <MDBMask overlay="purple-light" className="flex-center flex-column text-white text-center">
              <strong><h2>Random Video, Text & Audio Chat with Strangers</h2></strong><br></br>
              <h5>It provides free random chat with cool people in private chat rooms.</h5>
              <p>Chat with strangers & send pictures, videos in private free chat rooms. Meet & talk to strangers from all over the world.</p><br />      
              <div className="btn-group">
                <MDBNavLink 
                  to={ !this.state.restricted? "/guest" : '/#'}
                >
                  <MDBBtn 
                    color="secondary" 
                    size="lg"
                    disabled={this.state.restricted}
                  >
                    <MDBIcon icon="user-shield" className="mr-1" size="lg" /> Chat as a guest
                  </MDBBtn>
                </MDBNavLink>                    
              </div>
              {this.state.restricted ? <p className="verify-alert" >Your ip address is restricted from this chat</p> : null}
            </MDBMask>
          </MDBView>
        </header>

        <main>
          <MDBContainer className="text-center my-5">
            <p align="justify">Texting strangers might come naturally to some but others may have goose bumps when they are trying to text strangers. When you text strangers you are opening a window into a great text chat with strangers. The first few texts are the most difficult ones, once you have started texting and managed to move past opening texts the rest is easy peasy lemon squeezy. Sending a text to strangers is just like letter writing which was back then known as making pen pals. However, these days text to strangers chat room is a modern way of connecting with strangers. When you text strangers you are at the first step of a great conversation that could blossom into a good friendship or even a relationship. There are many examples in the world where people have found their soulmates when they were random texting strangers online. Many people online text with strangers in order to find some company and to talk to someone. When you send a text to strangers what happens next is a total mystery. It might end abruptly a couple of times whereas other times it might turn into a beautiful conversation and a pleasant experience.</p>
          </MDBContainer>
        </main>
      </div>
    );
  }
}

export default FullPageIntroWithFixedTransparentNavbar;