import React, { Component } from "react";
import {
    MDBJumbotron,
    MDBBtn,
    MDBRow,
    MDBCol,
    MDBCardTitle,
    MDBCardBody,
    MDBCloseIcon
  } from 'mdbreact';
import 'rc-slider/assets/index.css';

import "./FullScreenImage.css";

export default class FullScreenImage extends Component {
    constructor(props) {
        super(props);
        let imageUrl = this.props.imageUrl;
        let downloadPath = imageUrl.split("public/")[1];
        this.state = {
            downloadPath: downloadPath
        };
    }

    componentDidMount() {
        console.log("this is fullscreen image's path", this.state);
    }
    onShowImageFullScreen() {
        this.props.onShowImageFullScreen();
    }
    render() {
        return (
            
            <div>
                <div className="full-image">
                    <span 
                        onClick={this.onShowImageFullScreen.bind(this)}
                        className="close-btn"    
                    >
                        X
                    </span>
                    <a href={this.state.downloadPath} download="image-file" className="download-btn">
                        <i class="fa fa-download"></i>
                    </a>
                    <img src={this.props.imageUrl} alt=""></img>
                    
                </div>
            </div>
        );
    }
}