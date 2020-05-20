import React from 'react';
import { MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBModalFooter  } from 'mdbreact';
import 'whatwg-fetch';
import {
    NotificationContainer,
    NotificationManager
  } from "react-notifications";
  import "react-notifications/lib/notifications.css";

import { RESTAPIUrl } from '../../config/config';
import './AdminManage.css';

class AdminManage extends React.Component {
  constructor(props) {
    super(props);    

    this.state = {
        userListShow: true,
        userProfileShow: false,
        adminProfileShow: false,
        toggleWrapper: true,
    }

    this.updateUserProfile = this.updateUserProfile.bind(this);
  }

  componentDidMount() {
      this.getUserList();
      this.getAdminInfo();
  }

  componentDidUpdate() {
    const $button  = document.querySelector('#sidebar-toggle');
    const $wrapper = document.querySelector('#wrapper');
    
    $button.addEventListener('click', (e) => {
      e.preventDefault();
      $wrapper.classList.toggle('toggled');
    });
  }
  
  getUserList() {

    fetch(RESTAPIUrl + '/api/admin/manage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        
      }),
    }).then(res =>res.json())
      .then(json => {
        if(json.success) {
          this.setState({users: json.users});
        } else {
            NotificationManager.error(
                `${json.message}`
            );
        }
      })
  }

  getAdminInfo() {
      fetch(RESTAPIUrl + '/api/admin/get-info', {
          method: 'POST',
          headers: {
              'Content-Type' : 'application/json'
          },
          bpdy: JSON.stringify({

          }),          
      }).then(res => res.json())
      .then(json => {
          if(json.success) {
            this.setState({
                email: json.admin.email
            })
          } else {

          }
      })
  }

  updateUserProfile(user) {
    this.setState({
        userListShow: false,
        userProfileShow: true,
        selectedUser: user
    });
  }

  userListShow() {
      this.setState({
        userListShow: true,
        userProfileShow: false,
        adminProfileShow: false,
      });
  }

  adminProfileShow() {
    this.setState({
        userListShow: false,
        userProfileShow: false,
        adminProfileShow: true,
      });
  }

  handleChangeEmail(e) {
    this.setState({email: e.target.value});
  }

  handleChangePassword(e) {
    this.setState({password: e.target.value});
  }

  handleChangeConfirmPassword(e) {
    this.setState({confirmPassword: e.target.value});
  }

  enableUser() {
    console.log("sdfsdf", this.state.users);
    fetch(RESTAPIUrl + '/api/admin/enable-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: this.state.selectedUser
        }),
      }).then(res =>res.json())
        .then(json => {
          if(json.success) {
            NotificationManager.success(`${json.message}`);
            let selectedUser = json.user;
            this.setState({selectedUser});

            this.state.users.map((user, i) => {
                if(user._id === selectedUser._id) {
                    let users = this.state.users;
                    users[i] = selectedUser;
                    this.setState({users});
                    return true;
                }
                return false;
            })

          } else {
              NotificationManager.error(
                  `${json.message}`
              );
          }
        })
  }

  handleSubmit() {
    let { email, password, confirmPassword } = this.state;
    fetch(RESTAPIUrl + '/api/admin/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password,
            confirmPassword
        }),
      }).then(res =>res.json())
        .then(json => {
          if(json.success) {
            NotificationManager.success(`${json.message}`);
          } else {
              NotificationManager.error(
                  `${json.message}`
              );
          }
        })
  }

  toggleWrapper () {
      this.setState({toggleWrapper: !this.state.toggleWrapper})
  }
  render() {
    return (
        <div>
            <NotificationContainer /> 

            <aside id="sidebar-wrapper" className={!this.state.toggleWrapper ? 'expand-sidebar' : 'shrink-sidebar'}>
                <div className="sidebar-brand">
                </div>
                <ul className="sidebar-nav">
                <li>
                    <a href="!#"  onClick={this.userListShow.bind(this)}>
                        <i className="fa fa-tasks"></i>User Manage
                    </a>
                </li>
                <li>
                    <a href="!#" onClick={this.adminProfileShow.bind(this)}>
                        <i className="fa fa-user"></i>Profile
                    </a>
                </li>
                </ul>
            </aside>

            <div id="wrapper" className={this.state.toggleWrapper ? 'expand-wrapper' : 'shrink-wrapper'}>              

                <div id="navbar-wrapper">
                    <nav className="navbar navbar-inverse">
                    <div className="container-fluid">
                        <div className="navbar-header">
                        <a href="!#" className="navbar-brand" id="sidebar-toggle">
                            <i 
                                className="fa fa-bars"
                                onClick={this.toggleWrapper.bind(this)}    
                            >
                                
                            </i>
                        </a>
                        </div>
                    </div>
                    </nav>
                </div>

                {this.state.userListShow? 
                    <section className="content-wrapper user-manage">
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-10 offset-lg-1">
                            {
                                this.state.users ? (
                                    <div className="table-responsive">
                                        <table summary="This table shows how to create responsive tables using Bootstrap's default functionality" className="table table-bordered table-hover">
                                        <thead>
                                            <tr>
                                                <th>Num</th>
                                                <th>Avatar</th>
                                                <th>User Name</th>
                                                <th>Age</th>
                                                <th>Location</th>
                                                <th>Gender</th>
                                                <th>Ip Address</th>
                                                <th>Reported Number</th>
                                                <th>Allowed</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {                                    
                                            this.state.users.map((user, i) => {
                                                return (
                                                    <tr>
                                                        <td>{i+1}</td>
                                                        <td><img src={`${RESTAPIUrl}/public/profile/${user.profile_image}`} alt="profile-img"></img>   </td>
                                                        <td>{user.userName}</td>
                                                        <td>{user.age}</td>
                                                        <td>{user.location}</td>
                                                        <td>{user.gender}</td>
                                                        <td>{user.ip_address}</td>
                                                        <td>{user.report_number}</td>
                                                        <td>{user.isDeleted? 'Disabled' : 'Enabled'}</td>
                                                        <td>
                                                            <MDBBtn 
                                                                type="button" 
                                                                className="btn-block z-depth-1a"
                                                                size="sm"
                                                                color="primary"
                                                                onClick={()=>this.updateUserProfile(user)}
                                                                >
                                                                Update
                                                            </MDBBtn>
                                                        </td>
                                                    </tr>
                                                )
                                            })                                    
                                        }
                                        </tbody>
                                        </table>
                                        
                                    </div>
                                ) : 
                                (
                                    <div className="loading-container">
                                        <div className="loading"></div>
                                        <div id="loading-text">loading</div>
                                    </div>
                                )
                            }
                            
                            </div>
                        </div>


                    </section>
                : null
                }
                
                {this.state.adminProfileShow? 
                    <section className="content-wrapper ">
                        <MDBCol sm="10" md="7" lg="6" xl="4" className="mx-auto mt-3 admin-profile">
                            <form onSubmit={this.handleSubmit.bind(this)}>
                            <MDBCard>
                            <div className="text-center sign-title">
                                <h5 className="dark-grey-text mb-5"><strong> Update Profile</strong></h5>
                            </div>
                            <MDBCardBody className="mx-4">
                                
                                <MDBInput label="Your Email" group type="email" value= {this.state.email? this.state.email: ''} onChange={this.handleChangeEmail.bind(this)} validate error="wrong" success="right" required/>

                                <MDBInput group type="password" label="Password" onChange={this.handleChangePassword.bind(this)} validate error="wrong" success="right" required/>

                                <MDBInput group type="password" label="Confirm Password" onChange={this.handleChangeConfirmPassword.bind(this)} validate error="wrong" success="right" required/>

                                <div className="text-center pt-3 mb-3">
                                <MDBBtn 
                                    type="submit" 
                                    className="btn-block z-depth-1a"
                                    outline color="info"
                                    >
                                    Update
                                </MDBBtn>
                                </div>

                            </MDBCardBody>
                            <MDBModalFooter className="mx-5 pt-3 mb-1">
                                
                            </MDBModalFooter>
                            </MDBCard>
                            </form>
                        </MDBCol>
                    </section>
                : null 
                }

                {this.state.userProfileShow? 
                    <section className="content-wrapper ">
                        <MDBCol sm="10" md="10" lg="8" xl="6" className="mx-auto mt-3 user-profile">
                            <form onSubmit={this.handleSubmit.bind(this)}>
                            <MDBCard>
                                <div className="avatar-container">
                                    <img src={`${RESTAPIUrl}/public/profile/${this.state.selectedUser.profile_image}`} alt="user-img"></img>
                                    <h2>{this.state.selectedUser.userName}</h2>
                                </div> 

                                <div className="contact-information">
                                    <div className="contact-title">
                                        <span>PERSONAL & CONTACT INFORMATION</span>
                                    </div>
                                    <div className="contact-body">
                                        <div className="contact-sub-body">
                                            <div className="contact-sub-left">
                                                <i className="fa fa-transgender" aria-hidden="true"></i>
                                                Gender
                                            </div>
                                            <div className="contact-sub-right">
                                                <span>{this.state.selectedUser.gender}</span>
                                            </div>
                                        </div>

                                        <div className="contact-sub-body">
                                            <div className="contact-sub-left">
                                                <i className="fa fa-user"></i>
                                                User Name
                                            </div>
                                            <div className="contact-sub-right">
                                                <span>{this.state.selectedUser.userName}</span>
                                            </div>
                                        </div>

                                        <div className="contact-sub-body">
                                            <div className="contact-sub-left">
                                                <i className="fa fa-birthday-cake" aria-hidden="true"></i>
                                                Age
                                            </div>
                                            <div className="contact-sub-right">
                                                <span>{this.state.selectedUser.age}</span>
                                            </div>
                                        </div>

                                        <div className="contact-sub-body">
                                            <div className="contact-sub-left">
                                                <i className="fas fa-map-marker-alt"></i>
                                                Location
                                            </div>
                                            <div className="contact-sub-right">
                                                <span>{this.state.selectedUser.location}</span>
                                            </div>
                                        </div>

                                        <div className="contact-sub-body">
                                            <div className="contact-sub-left">
                                                <i className="fa fa-server" aria-hidden="true"></i>
                                                Ip Address
                                            </div>
                                            <div className="contact-sub-right">
                                                <span>{this.state.selectedUser.ip_address}</span>
                                            </div>
                                        </div>

                                        <div className="contact-sub-body">
                                            <div className="contact-sub-left">
                                                <i className="fa fa-ban" aria-hidden="true"></i>
                                                Allowed
                                            </div>
                                            <div className="contact-sub-right">
                                                <div className="button-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        id="switch-blue" 
                                                        className="switch"
                                                        onChange={this.enableUser.bind(this)}
                                                        checked={!this.state.selectedUser.isDeleted} 
                                                    />
                                                    <label for="switch-blue" className="lbl-off">No</label>
                                                    <label for="switch-blue" className="lbl-on">Yes</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="contact-sub-body">
                                            <div className="contact-sub-left">
                                                <i className="fa fa-file" aria-hidden="true"></i>
                                                Report Number
                                            </div>
                                            <div className="contact-sub-right">
                                                <span>{this.state.selectedUser.report_number}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="report-title">
                                        <span>REPORT LIST</span>
                                    </div>
                                    <div className="report-body">
                                        {this.state.selectedUser.report_reason.map((object, i) => {
                                            return(
                                                <div className="report-sub-body">                                            
                                                        
                                                    {this.state.users.map((user) => {
                                                        if(user._id === object.reporter_id) {
                                                            return (
                                                                <div className="report-sub-left">
                                                                    <img src={`${RESTAPIUrl}/public/profile/${user.profile_image}`} alt="reporter_img"></img><span>{user.userName}</span>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                    
                                                    <div className="contact-sub-right">
                                                        <span>{object.reason}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        
                                        
                                    </div>
                                </div>

                            </MDBCard>
                            </form>
                        </MDBCol>
                    </section>
                : null 
                }

            </div>
        </div>
    );  
  }
}

export default AdminManage;