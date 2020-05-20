import React, { Component } from "react";
import {
    MDBJumbotron,
    MDBBtn,
    MDBRow,
    MDBCol,
    MDBCardTitle,
    MDBCardBody,
    MDBCloseIcon,
} from 'mdbreact';
import {
    NotificationManager
} from "react-notifications";

import { RESTAPIUrl } from "../../config/config";
import "./ReportBox.css";

export default class ReportBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reportList: ['Spam', 'Inappropriate or Vulgar Content', 'Illegal Content', 'Abusive behaviour', 'Other'],
            reportReason: '',
            inputTextActive: false,
        }

    }

    handleReport(e) {
        e.preventDefault();
        if( typeof this.props.targetUser._id == 'undefined' ) {            
            NotificationManager.error(
                "Please select target user"
            );
            return false;
        }
        fetch(RESTAPIUrl + '/api/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reportUser: this.props.signedInUser,
                targetUser: this.props.targetUser,
                reason: this.state.reportReason
            }),
        }).then(res =>res.json())
        .then(json => {
            if(json.status) {
                NotificationManager.success(
                    json.message
                );
            } else {
                NotificationManager.error(
                    json.message
                );
            }
        });

    }

    handleChangeReportSetting(e) {
        if(e.target.value !== "Other") {
            this.setState({
                reportReason: e.target.value,
                inputTextActive: false,
            })
        } else {
            this.setState({inputTextActive: true});
        }
    }

    handleOtherReason(e) {
        this.setState({reportReason: e.target.value});
    }

    onReportModalShow() {
        this.props.onReportModalShow(false);
    }

    render() {
        return ( 
            <div>
                <MDBRow  className = {` ${this.props.reportContainer} `} >
                    <MDBCol>
                        <MDBCloseIcon onClick = { this.onReportModalShow.bind(this) }/>

                        <MDBJumbotron className = 'text-center' >
                            <MDBCardTitle className = "card-title h4 pb-2" >
                                <strong > Report User </strong> 
                            </MDBCardTitle > 
                            <hr></hr>
                            <MDBCardBody >
                                <form onSubmit = { this.handleReport.bind(this) } >
                                    <div>
                                        <div className = "form-group" >
                                            {this.state.reportList.map((object, i) => 
                                                {
                                                    return (
                                                        <div className = "radio" key={`${object}-container`}>
                                                            <input 
                                                                id = {`report-radio${i}`}
                                                                name = 'report-radio'
                                                                type = "radio"
                                                                value = {object}
                                                                key = {object}
                                                                onChange = { this.handleChangeReportSetting.bind(this) }
                                                            /> 
                                                    
                                                            <label htmlFor = {`report-radio${i}`} className = "radio-label" > {object} </label> 
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>

                                        <div className="form-group">
                                            {this.state.inputTextActive?
                                                <div className="form-group report-reason">
                                                    <textarea
                                                        className="form-control"
                                                        id="exampleFormControlTextarea1"
                                                        rows="3"
                                                        onChange={ this.handleOtherReason.bind(this) }
                                                        required
                                                    />
                                                </div>
                                                :
                                                null
                                            }
                                            
                                            
                                        </div>

                                        <div className = "text-center pt-3 mb-3" >
                                            <MDBBtn
                                                type="submit"
                                                color = "cyan" 
                                                size = "sm"
                                            >
                                                Report
                                            </MDBBtn> 
                                            <MDBBtn 
                                                color = "cyan" 
                                                size = "sm"
                                                onClick = { this.onReportModalShow.bind(this) } 
                                            >
                                                Close 
                                            </MDBBtn> 
                                        </div>
                                    </div> 
                                </form >

                            </MDBCardBody> 
                        </MDBJumbotron> 
                    </MDBCol> 
                </MDBRow > 
            </div>
    );
}
}