import React, { Component } from "react";
import InputGroup from "react-bootstrap/lib/InputGroup";
import Row from "react-bootstrap/lib/Row";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Col from "react-bootstrap/lib/Col";
import Jumbotron from "react-bootstrap/lib/Jumbotron";
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MessageList,
  Navbar as NavbarComponent,
  Avatar
} from "react-chat-elements";
import { MDBBtn ,MDBIcon, MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem } from 'mdbreact';

// Emoji icon module
import { Smile } from 'react-feather';
import { Picker, emojiIndex } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

// Font Selector module- draft.js
import { EditorState, convertToRaw, ContentState, RichUtils, getDefaultKeyBinding, KeyBindingUtil } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { RESTAPIUrl } from '../config/config';
/**
 *
 * ChatBox Component
 *
 * displays all the messages from chat history.
 * renders message text box for input.
 */


export default class ChatBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEmojiPicker: false,
      toolbar_show : false,
      messageText: "",
      editorState: EditorState.createEmpty(),
    }

    this.onAttachFile = this.onAttachFile.bind(this);
  }
  /**
   *
   * Sends a message only if it is not falsy.
   */
  onSendClicked() {
    // if (!this.state.messageText) {
    //   return;
    // }
    // this.props.onSendClicked(this.state.messageText);
    // this.setState({ messageText: "" });
    this.props.onSendClicked(draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())));
    this.setState({editorState:EditorState.createEmpty()});
  }
  onMessageInputChange(e) {
    this.setState({ messageText: e.target.value });
  }
  /**
   *
   * @param {KeyboardEvent} e
   *
   * listen for enter pressed and sends the message.
   */
  onMessageKeyPress(e) {
    if (e.key === "Enter") {
      this.onSendClicked();
    }
  }

  toggleEmojiPicker() {
    this.setState({
      showEmojiPicker: !this.state.showEmojiPicker,
    });
  }
  
  addEmoji(emoji) {
    // if(this.state.messageText) {
    //   var { messageText } = this.state;
    // } else {
    //   var messageText = '';
    // }
    // const text = `${messageText}${emoji.native}`;
  
    // this.setState({
    //   messageText: text,
    // });
    const { editorState } = this.state;
    const convertHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    const subHtml = convertHtml.substring(0,(convertHtml.length-5));
    const totalHtml = `${subHtml}${emoji.native}</p>`;

    const blocksFromHtml = htmlToDraft(totalHtml);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const editorStateChange = EditorState.createWithContent(contentState);
    this.setState({editorState: editorStateChange});

    console.log('this is convert html',totalHtml);
  }

  closeEmojiPicker() {
    this.setState({showEmojiPicker: false});
  }

  onEditorStateChange =  (editorState) => {
    this.setState({
      editorState,
    });
  };

  onEditorChange() {
    this.props.onTyping();
  }

  toggle_toolbar() {
    console.log("toggle button clicked", this.state);    
    this.setState({toolbar_show: !this.state.toolbar_show});
  }

  keyBindingFunction(event) {

    if (KeyBindingUtil.hasCommandModifier(event) && event.ctrlKey && event.key === 'Enter') {
      return getDefaultKeyBinding(event);
    }
  
    if (event.key === 'Enter') {
      this.onSendClicked();
      console.log("Enter Key pressed");
      return;
    }
    return getDefaultKeyBinding(event);
  }

  findTargetUser() {
    this.props.findTargetUser();
  }

  onAttachFile(e) {
    e.preventDefault();

    console.log("file changed");
    // this.props.onAttachFile();
    const data = new FormData();
    data.append('attachFile', this.attachFile.files[0]);
    fetch(`${RESTAPIUrl}/api/attach-file`, {
      method: 'POST',
      body: data,
    })
    .then(res => res.json())
    .then(json => {
      if(json.status) {
        const { editorState } = this.state;
        const convertHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        console.log("this is convert html",convertHtml);
        const subHtml = convertHtml.substring(0,(convertHtml.length-5));
        const fileContainer = `<img src="${RESTAPIUrl}/public/uploads/${json.fileName}" className="upload-image"></img>`
        const totalHtml = `${subHtml}${fileContainer}</p>`;

        const blocksFromHtml = htmlToDraft(totalHtml);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        const editorStateChange = EditorState.createWithContent(contentState);
        this.setState({editorState: editorStateChange});

        console.log('this is convert html',totalHtml);

      }
    })
  }
  image_thumbs() {
    console.log("image thumbs start");
  }

  callWithVideo (video) {
    const config = { audio: true, video };
    // return () => this.props.targetUser.id && this.props.startCall(true, this.props.targetUser.id, config);
    this.props.startCall(true, this.props.targetUser.id, config);
  };

  render() {
    return (
      <div>        
          <div>
            <NavbarComponent
              left={
                <div>
                  <Col mdHidden lgHidden>
                    <p className="navBarText">
                    </p>
                  </Col>
                  <Avatar
                    src={`${RESTAPIUrl}/public/profile/${this.props.signedInUser.profile_image}`}
                    alt={"logo"}
                    size="large"
                    type="circle flexible"
                  />
                  <div className="user-info">
                    <p className="navBarText user-name">{this.props.signedInUser.userName}</p>
                    <p className="navBarText user-title">{this.props.signedInUser.gender}   {this.props.signedInUser.age} {this.props.signedInUser.location}</p>
                  </div>
                </div>
              }
              center={
                <div>
                  <MDBBtn 
                    className="action-btn next-user" 
                    color="primary"
                    onClick={this.findTargetUser.bind(this)}
                  >
                    <img alt="Arrow, person, profile, right, user icon" className="n3VNCb" src="https://cdn3.iconfinder.com/data/icons/user-icons-7/100/31-1User-512.png" />
                  </MDBBtn>
                </div>
                
                
              }
              right={
                <div>
                  <div className="navbar-right">                    
                    <MDBBtn 
                      className="action-btn phone" 
                      color="primary"
                      onClick={this.callWithVideo.bind(this, false)}
                    >
                      <MDBIcon icon="phone-alt" className="mr-1" size="lg" />
                    </MDBBtn>
                    
                    <MDBBtn 
                      className="action-btn video" 
                      color="primary"
                      onClick={this.callWithVideo.bind(this, true)}
                    >
                      <MDBIcon icon="video" className="mr-1" size="lg" />
                    </MDBBtn>
                    
                    <MDBDropdown>
                      <MDBDropdownToggle caret color="primary">
                        <MDBIcon icon="ellipsis-v" className="mr-1" size="lg" />
                      </MDBDropdownToggle>
                      <MDBDropdownMenu basic>
                        <MDBDropdownItem
                          onClick={()=> {this.props.onSearchSettingModalShow(true)}}
                        >
                          Search Setting
                        </MDBDropdownItem>

                        <MDBDropdownItem>Report</MDBDropdownItem>
                        
                        <MDBDropdownItem
                          onClick={()=> {this.props.onProfileModalShow(true)}}
                        >
                          Your Profile
                        </MDBDropdownItem>
                        <MDBDropdownItem divider />
                        
                        <MDBDropdownItem>
                          Log Out
                        </MDBDropdownItem> 

                      </MDBDropdownMenu>
                    </MDBDropdown>
                    
                  </div>
                </div>
              }
            />
            {this.props.targetUser.id ? (
              <div> 
                <MessageList
                  className="message-list"
                  lockable={true}
                  toBottomHeight={"100%"}
                  dataSource={this.props.targetUser.messages}
                />
                <FormGroup className="send-message-form">
                  <Row style={{width:"100%", position:"relative"}}>
                      {/* <button
                        type="button"
                        className="toggle-emoji"
                        onClick={this.toggleEmojiPicker.bind(this)}
                      >
                        <i class="far fa-smile"></i>
                      </button> */}
                      <i 
                        className="toggle-emoji far fa-smile toggle-icon"
                        onClick={this.toggleEmojiPicker.bind(this)} 
                      ></i>
                      {/* <button 
                        onClick={this.toggle_toolbar.bind(this)}
                        className="font-selector"
                      >
                        <MDBIcon icon="font" className="mr-1" size="lg" />
                      </button> */}
                      <MDBIcon 
                        icon="font" 
                        size="lg"
                        onClick={this.toggle_toolbar.bind(this)}
                        className="font-selector mr-1 toggle-icon"
                      />
                      
                      <Editor
                        editorState={this.state.editorState}
                        wrapperClassName="demo-wrapper"
                        toolbarClassName={this.state.toolbar_show ? '' : 'toggle-toolbar'}
                        editorClassName="demo-editor"
                        keyBindingFn={this.keyBindingFunction.bind(this)}
                        onEditorStateChange={this.onEditorStateChange}
                        onChange={this.onEditorChange.bind(this)}
                        toolbar={{
                          options: ['inline', 'image', 'colorPicker', 'fontSize', 'fontFamily', 'emoji', 'history'],
                          inline: { inDropdown: true },
                          image: { uploadEnabled: true},
                          inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                        }}
                        autoFocus
                      />
                      
                      <label htmlFor="attachFile" className="attach-file">
                        <i 
                          className="fas fa-paperclip toggle-icon "                   
                        ></i>
                      </label>
                      
                      <input 
                          ref={(ref) => { this.attachFile = ref; }} 
                          onChange={this.onAttachFile.bind(this)} 
                          type="file"
                          id="attachFile" 
                          accept=".png, .jpg, .jpeg"
                      />

                      <InputGroup.Button>
                        <div
                          disabled={!this.state.messageText}
                          className="sendButton"
                          onClick={this.onSendClicked.bind(this)}
                        >
                          <FontAwesomeIcon icon={faPaperPlane} color="white" />
                        </div>
                      </InputGroup.Button>

                  </Row>
                </FormGroup>
              </div>
            ) : (
              <div className="waiting-container">
                <div className="title-box">
                  <h1>Hello, {this.props.signedInUser.userName}!</h1><br></br>
                </div>
                <div className="body-box">
                  <p>Select a friend to start a chat.</p>
                </div>
              </div>
            )}
          </div>
        
          
        { this.state.showEmojiPicker ? (
          <div>
            <Picker style={{ position: 'absolute', bottom: '90px', right: '10px' }} onSelect={this.addEmoji.bind(this)} />
            <div className="emoji-back" onClick={this.closeEmojiPicker.bind(this)}></div>
          </div>
        ): null }       
        
      </div>
    );
  }
}
