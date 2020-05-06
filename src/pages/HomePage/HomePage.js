import React from 'react';
import { MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavbarToggler, MDBCollapse, MDBNavItem, MDBNavLink, MDBContainer, MDBMask, MDBView, MDBBtn, MDBIcon } from 'mdbreact';
import { BrowserRouter as Router } from 'react-router-dom';
import './HomePage.css';

class FullPageIntroWithFixedTransparentNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: false,
      isWideEnough: false,
    };
    this.onClick = this.onClick.bind(this);
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
          <Router>
            <MDBNavbar color="bg-primary" fixed="top" dark expand="md" scrolling transparent>
              <MDBContainer size="md">            
                <MDBNavbarBrand href="/">
                  <strong className="navbar-title">Chat With Stranger</strong>
                </MDBNavbarBrand>
                {!this.state.isWideEnough && <MDBNavbarToggler onClick={this.onClick} />}
                <MDBCollapse isOpen={this.state.collapse} navbar>
                  <MDBNavbarNav right>
                    <MDBNavItem>
                      <MDBNavLink to="/guest">GUEST</MDBNavLink>
                    </MDBNavItem>
                    <MDBNavItem>
                      <MDBNavLink to="/login">SIGN IN</MDBNavLink>
                    </MDBNavItem>
                    <MDBNavItem>
                      <MDBNavLink to="/register">SIGN UP</MDBNavLink>
                    </MDBNavItem>                    
                  </MDBNavbarNav>
                </MDBCollapse>
              </MDBContainer>
            </MDBNavbar>
          </Router>

          <MDBView src={process.env.PUBLIC_URL + '/background.jpg'}>
            <MDBMask overlay="purple-light" className="flex-center flex-column text-white text-center">
              <strong><h2>Random Video, Text & Audio Chat with Strangers</h2></strong><br></br>
              <h5>It provides free random chat with cool people in private chat rooms.</h5>
              <p>Chat with strangers & send pictures, videos in private free chat rooms. Meet & talk to strangers from all over the world.</p><br />      
              <div className="btn-group">
                <MDBNavLink to="/guest">
                  <MDBBtn color="secondary" size="lg">
                    <MDBIcon icon="user-shield" className="mr-1" size="lg" /> Chat as a guest
                  </MDBBtn>
                </MDBNavLink>
                <MDBNavLink to="/usersign">
                  <MDBBtn color="primary" size="lg">
                    <MDBIcon icon="user" className="mr-1" size="lg" /> Login as a user
                  </MDBBtn>
                </MDBNavLink>            
              </div>              
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