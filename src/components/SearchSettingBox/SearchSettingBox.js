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
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { countries } from "../../config/country";
import "./SearchSettingBox.css";

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

export default class SearchSettingBox extends Component {
    constructor(props) {
        super(props);
        const temp = this.props.searchSetting
        this.state = {
            searchSetting: temp,
        }

        this.handleChangeGender = this.handleChangeGender.bind(this);
    }

    handleChangeSearchSetting(e) {
        e.preventDefault();

    }

    handleChangeGender(e) {
        let searchSetting = this.state.searchSetting;
        searchSetting.gender = e.target.value;
        this.setState({ searchSetting });
    }

    handleChangeLocation(e) {
        let searchSetting = this.state.searchSetting;
        searchSetting.location = e.target.value;
        this.setState({ searchSetting });
    }

    handleChangeAge(value) {
        let searchSetting = this.state.searchSetting;
        searchSetting.ageMin = value[0];
        searchSetting.ageMax = value[1];
        this.setState({ searchSetting });

        // this.setState({
        //     ageMin: value[0],
        //     ageMax: value[1],
        // })
    }
    onSearchSettingModalShow() {
        this.props.onSearchSettingModalShow(false);
    }

    render() {
        return ( 
            <div>
                <MDBRow className = {`${this.props.searchContainer}` } >
                    <MDBCol>
                        <MDBCloseIcon onClick = { this.onSearchSettingModalShow.bind(this) }/>

                        <MDBJumbotron className = 'text-center' >
                            <MDBCardTitle className = "card-title h4 pb-2" >
                                <strong > Search Filter Setting </strong> 
                            </MDBCardTitle > 
                            
                            <MDBCardBody >
                                <form onSubmit = { this.handleChangeSearchSetting.bind(this) } >
                                    <div>
                                        <div className = "form-group" >
                                            <label className = "form-label" > Location </label> 
                                            <select className = "browser-default custom-select" id = "location1" name = "location1" value = { this.props.searchSetting.location } onChange = { this.handleChangeLocation.bind(this) } >
                                                <option value = ""> All </option> 
                                                {countries.map((object, i) => 
                                                    {
                                                        return <option value = { object } key = { i } > { object } </option>
                                                    })
                                                } 
                                            </select> 
                                        </div >

                                        <div className = "form-group" >
                                            <label className = "form-label"> Age Range </label> 
                                            <Range min = { 13 } max = { 99 } defaultValue = { [this.props.searchSetting.ageMin, this.props.searchSetting.ageMax]} tipFormatter = { value => `${value}` } onChange = { this.handleChangeAge.bind(this) }/> 
                                        </div >

                                        <div className = "form-group" >
                                            <label className = "form-label" > Gender </label> 
                                            <div className = "radio-group" >
                                                <div className = "radio" >
                                                    <input id = "radio1"
                                                        name = "radio1"
                                                        type = "radio"
                                                        value = ""
                                                        onChange = { this.handleChangeGender.bind(this) }
                                                        checked = { this.state.searchSetting.gender === '' }
                                                    /> 
                                            
                                                    <label htmlFor = "radio1" className = "radio-label" > All </label> 
                                                </div>

                                                <div className = "radio" >
                                                    <input id = "radio2"
                                                        name = "radio1"
                                                        type = "radio"
                                                        value = "Male"
                                                        onChange = { this.handleChangeGender.bind(this) }
                                                        checked = { this.state.searchSetting.gender === 'Male' }
                                                    /> 
                                                    <label htmlFor = "radio2" className = "radio-label" > Male </label> 
                                                </div>

                                                <div className = "radio">
                                                    <input id = "radio3" name = "radio1"
                                                        type = "radio"
                                                        value = "Female"
                                                        onChange = { this.handleChangeGender.bind(this) }
                                                        checked = { this.state.searchSetting.gender === 'Female' }
                                                    /> 
                                                    <label htmlFor = "radio3" className = "radio-label" > Female </label> 
                                                </div>
                                            </div> 
                                        </div>

                                        <div className = "text-center pt-3 mb-3" >

                                            <MDBBtn 
                                                color = "cyan" 
                                                size = "sm"
                                                onClick = { this.onSearchSettingModalShow.bind(this) } 
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