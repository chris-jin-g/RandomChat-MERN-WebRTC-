import React, { Component } from "react";
import {
    MDBJumbotron,
    MDBBtn,
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCardTitle,
    MDBIcon,
    MDBNavLink,
    MDBNav,
    MDBCardImage,
    MDBCardBody,
    MDBCardText,
    MDBInput,
    MDBInputSelect,
    MDBCloseIcon
  } from 'mdbreact';
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
        console.log("upload file name", this.fileName.value);
        fetch(`${RESTAPIUrl}/api/profile`, {
          method: 'POST',
          body: data,
        })
        .then(res =>res.json())
        .then(json => {
            console.log('this is json object', json);
            if(json.status) {
                setInStorage('guest_signin', {token:json.token});
                let decoded_token = jwt_decode(json.token);
                let signedInUser = decoded_token.user;
                this.props.onChangeProfile(signedInUser);       
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

    handleChangeProfile() {
        console.log("bind this");
    }

    onProfileModalShow() {
        this.props.onProfileModalShow(false);
    }
    
    handleChangeLocation() {
    }
    
    handleChangeGender() {

    }

    render() {
        return (
            <div>
                <MDBRow className='mt-5' className={this.props.profileContainer}>
                    <MDBCol>
                        <MDBCloseIcon onClick={this.onProfileModalShow.bind(this)}/>
                        <MDBJumbotron className='text-center'>                          
                            
                            <MDBCardBody>

                                <form onSubmit={this.handleChangeProfile}>
                                    <div className="profile-image">
                                        <img
                                            src={`${RESTAPIUrl}/public/profile/${this.props.profileInfo.profile_image}`}
                                            className='img-fluid'
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
                                            onChange={this.handleChangeName} 
                                            validate error="wrong" 
                                            success="right"
                                            value={this.props.profileInfo.userName}
                                            required
                                        />
                                        
                                        <label className="form-label" >Your Location</label>
                                        <select 
                                            className="browser-default custom-select" 
                                            id="location" 
                                            name="location" 
                                            value={this.props.profileInfo.location} 
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
                                            getValue={this.handleChangeAge} 
                                            min={13} 
                                            max={99} 
                                            value={this.props.profileInfo.age} 
                                            className='mb-2' 
                                        />
                                        
                                        <label className="form-label">Your Gender</label>
                                        <div className="radio-group">
                                            <div className="radio">
                                                <input id="radio-1" name="radio" type="radio" value="Male" onChange={this.handleChangeGender.bind(this)} checked={this.state.gender === 'Male'} />
                                                <label htmlFor="radio-1" className="radio-label">Male</label>
                                            </div>

                                            <div className="radio">
                                                <input id="radio-2" name="radio" type="radio" value="Female" onChange={this.handleChangeGender.bind(this)} checked={this.state.gender === 'Female'} />
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