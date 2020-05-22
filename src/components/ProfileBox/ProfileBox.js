import React, { Component } from "react";
import {
    MDBJumbotron,
    MDBBtn,
    MDBRow,
    MDBCol,
    MDBCardBody,
    MDBInput,
    MDBInputSelect,
    MDBCloseIcon
  } from 'mdbreact';

import {
    NotificationContainer,
    NotificationManager
} from "react-notifications";
import jwt_decode from "jwt-decode";
import { RESTAPIUrl } from '../../config/config';
import { setInStorage } from "../../utils/storage";
import { countries } from "../../config/country";

import "./ProfileBox.css";




export default class ChatBox extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            imageURL: `${RESTAPIUrl}/public/profile/${this.props.profileInfo.profile_image}`,
            userName: this.props.profileInfo.userName,
            age: this.props.profileInfo.age,
            location: this.props.profileInfo.location,
            gender: this.props.profileInfo.gender,
            imageHash: this.props.imageHash
        }

        this.handleUploadImage = this.handleUploadImage.bind(this);
        this.handleChangeProfile = this.handleChangeProfile.bind(this);
    }
    componentWillReceiveProps() {
        this.setState({
            imageURL: `${RESTAPIUrl}/public/profile/${this.props.profileInfo.profile_image}`
        });
    }
    handleUploadImage(ev) {
        ev.preventDefault();
    
        const data = new FormData();
        data.append('file', this.uploadInput.files[0]);
        data.append('fileName', this.fileName.value);
        
        fetch(`${RESTAPIUrl}/api/profile/image`, {
          method: 'POST',
          body: data,
        })
        .then(res =>res.json())
        .then(json => {
            if(json.status) {
                setInStorage('guest_signin', {token:json.token});
                this.props.updateProfile();

                // this.setState({imageHash: Date.now()});

                let decoded_token = jwt_decode(json.token);
                let signedInUser = decoded_token.user;
                // this.props.onChangeProfile(signedInUser);
                this.setState({
                    imageURL: `${RESTAPIUrl}/public/profile/${signedInUser.profile_image}`,
                    imageHash: Date.now()
                });    
            } else {
                alert("Server Error");
            }
        })
        
        
        // .then((response) => {
        //   response.json().then((body) => {
        //     this.setState({ imageURL: `http://localhost:5000/${body.file}` });
        //   });
        // });
    }

    handleChangeProfile(e) {
        e.preventDefault();
        const { userName, location, age, gender } = this.state;
        const { _id } = this.props.profileInfo;
        this.setState ({ 
            loginLoading: true, 
        });

        fetch(RESTAPIUrl + '/api/profile/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            _id,
            userName,
            location,
            age,
            gender
        }),
        }).then(res =>res.json())
        .then(json => {
            if(json.status) {
                setInStorage('guest_signin', {token:json.token});
                this.props.updateProfile();
                this.props.onProfileModalShow(false);
                NotificationManager.success(
                    `${json.message}`
                );
            } else {
                NotificationManager.error(
                    `${json.message}`
                );
            }
        });
    }

    onProfileModalShow() {
        this.props.onProfileModalShow(false);
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

    render() {
        return (
            <div>
                <NotificationContainer /> 
                <MDBRow className={`${this.props.profileContainer}`}>
                    <MDBCol>
                        <MDBCloseIcon onClick={this.onProfileModalShow.bind(this)}/>
                        <MDBJumbotron className='text-center'>                          
                            
                            <MDBCardBody>

                                <form onSubmit={this.handleChangeProfile}>
                                    <div className="profile-image">
                                        <img
                                            src={`${this.state.imageURL}?${this.state.imageHash}`}
                                            className='img-fluid'
                                            alt="profile-img"
                                        />
                                        <div className="upload-button">
                                            <label htmlFor="imageUpload"></label>
                                            <input 
                                                ref={(ref) => { this.uploadInput = ref; }} 
                                                onChange={this.handleUploadImage.bind(this)} 
                                                type="file"
                                                id="imageUpload" 
                                                accept=".png, .jpg, .jpeg"
                                            />
                                            <input ref={(ref) => { this.fileName = ref; }}
                                                value={this.props.profileInfo.profile_image}
                                                type="hidden"
                                            />
                                        </div>
                                        <h4 className="userName">{this.props.profileInfo.userName}</h4>
                                        <h6 className="userInfo">
                                            {`${this.props.profileInfo.gender}  ${this.props.profileInfo.age}  ${this.props.profileInfo.location}`}
                                        </h6>
                                        <hr></hr>
                                    </div>
                                    <div>
                    
                                        <MDBInput 
                                            label="Your Name" 
                                            ref={(ref) => { this.userName = ref; }}
                                            group type="text" 
                                            onChange={this.handleChangeName.bind(this)} 
                                            validate error="wrong" 
                                            success="right"
                                            value={this.state.userName }
                                            required
                                            disabled
                                        />
                                        
                                        <label className="form-label" >Your Location</label>
                                        <select 
                                            className="browser-default custom-select" 
                                            id="location" 
                                            name="location" 
                                            value={this.state.location} 
                                            onChange={this.handleChangeLocation.bind(this)} 
                                        >
                                            <option>Choose your location</option>
                                            {
                                                countries.map((object, i) => {
                                                return <option value={object} key={i}>{object}</option>
                                                })
                                            }
                                        </select>

                                        <label className="form-label" >Your Age</label>
                                        <MDBInputSelect  
                                            id="age" 
                                            name="age" 
                                            getValue={this.handleChangeAge.bind(this)} 
                                            min={13} 
                                            max={99} 
                                            value={this.state.age } 
                                            className='mb-2' 
                                        />
                                        
                                        <label className="form-label">Your Gender</label>
                                        <div className="radio-group">
                                            <div className="radio">
                                                <input id="radio-1" name="radio" type="radio" value="Male" onChange={this.handleChangeGender.bind(this)} checked={this.state.gender === 'Male'} disabled/>
                                                <label htmlFor="radio-1" className="radio-label">Male</label>
                                            </div>

                                            <div className="radio">
                                                <input id="radio-2" name="radio" type="radio" value="Female" onChange={this.handleChangeGender.bind(this)} checked={this.state.gender === 'Female'} disabled/>
                                                <label  htmlFor="radio-2" className="radio-label">Female</label>
                                            </div>  
                                        </div>

                                        <div className="text-center pt-3 mb-3">
                                        <MDBBtn 
                                            type="submit"
                                            color="primary"
                                            size="sm"
                                            >
                                            Apply
                                        </MDBBtn>

                                        <MDBBtn color="cyan" size="sm"
                                            onClick={this.onProfileModalShow.bind(this)}
                                        >
                                            Close
                                        </MDBBtn>
                                        </div>

                                    </div>
                                </form>

                            </MDBCardBody>
                        </MDBJumbotron>
                    </MDBCol>
                    </MDBRow>
            </div>
        );
    }
}