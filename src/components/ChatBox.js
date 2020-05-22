import React, { Component } from "react";
import InputGroup from "react-bootstrap/lib/InputGroup";
import Row from "react-bootstrap/lib/Row";
import FormGroup from "react-bootstrap/lib/FormGroup";
import {
  MessageList,
  Navbar as NavbarComponent,
  Avatar 
} from "react-chat-elements";
import { MDBBtn ,MDBIcon, MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem } from 'mdbreact';

// MDI icon import
import Icon from '@mdi/react'
import { mdiPhone, mdiVideoOutline, mdiDotsVertical } from '@mdi/js'

// Emoji icon module
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

// Font Selector module- draft.js
import { EditorState, convertToRaw, ContentState, getDefaultKeyBinding, KeyBindingUtil } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { SketchPicker } from 'react-color';
import { toggleCustomInlineStyle } from 'draftjs-utils';
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
      showColorPicker: false,
      pickerColor: 'RGB(0,0,0)',
      messageText: "",
      editorState: EditorState.createEmpty(),
    }

    this.onAttachFile = this.onAttachFile.bind(this);
    this.setDomEditorRef = ref => this.domEditor = ref;
  }
  
  componentDidMount() {
    // this.domEditor.focusEditor();
  }

  onSendClicked() {
    // if (!this.state.messageText) {
    //   return;
    // }
    // this.props.onSendClicked(this.state.messageText);
    // this.setState({ messageText: "" });
    this.props.onSendClicked(draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())));
    this.setState({editorState:EditorState.createEmpty()});
    this.domEditor.focusEditor();
    // @@@@@@@@@@@@@@@@@@@@@@@
    setTimeout(
      function() {
        const newState = toggleCustomInlineStyle(this.state.editorState, 'color', this.state.pickerColor);
        this.setState({
          editorState: newState,
          showColorPicker: false
        });
      }
      .bind(this),
      10
    );
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
    // const selectEmoji = document.querySelector('[title=' + emoji.id +']');

    const { editorState } = this.state;
    const convertHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    const subHtml = convertHtml.substring(0,(convertHtml.length-5));
    // const totalHtml = `${subHtml}${emoji.native}</p>`;
    const totalHtml = `${subHtml} :${emoji.id}: </p>`;
    
    const blocksFromHtml = htmlToDraft(totalHtml);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const editorStateChange = EditorState.createWithContent(contentState);
    this.setState({editorState: editorStateChange});
  }

  closeEmojiPicker() {
    this.setState({showEmojiPicker: false});
  }

  onEditorStateChange =  (editorState) => {
    this.setState({
      editorState,
    });
  };

  // onEditorChange() {
  //   this.props.onTyping();
  // }

  toggle_toolbar() {   
    this.setState({toolbar_show: !this.state.toolbar_show});
  }

  keyBindingFunction(event) {

    // Call onTyping function to let contact user typing status
    this.props.onTyping();
    if (KeyBindingUtil.hasCommandModifier(event) && event.ctrlKey && event.key === 'Enter') {
      return getDefaultKeyBinding(event);
    }
  
    if (event.key === 'Enter') {
      this.onSendClicked();
      return;
    }
    return getDefaultKeyBinding(event);
  }

  findTargetUser() {
    this.props.findTargetUser();
  }

  onAttachFile(e) {
    e.preventDefault();

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
        var subHtml = '';
        // if(convertHtml.substring(convertHtml.length-5) == '</p>')
        //   subHtml = convertHtml.substring(0,(convertHtml.length-5));
        // else 
          subHtml = convertHtml.substring(0,(convertHtml.length));
        const fileContainer = `<img src="${RESTAPIUrl}/public/uploads/${json.fileName}" alt="${RESTAPIUrl}/public/uploads/${json.fileName}">`;
        const totalHtml = `${subHtml}${fileContainer}`;

        const blocksFromHtml = htmlToDraft(totalHtml);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        const editorStateChange = EditorState.createWithContent(contentState);
        this.setState({editorState: editorStateChange});

        // Focus editor box after file select.
        this.domEditor.focusEditor();

      }
    })
  }
  image_thumbs() {
    console.log("image thumbs start");
  }

  toggleColorPicker() {
    this.setState({showColorPicker: !this.state.showColorPicker})
  }
  hideColorPicker() {
    this.setState({showColorPicker: false});
  }

  onApplyColorPicker() {
    // const newState = toggleCustomInlineStyle(this.state.editorState, 'color', rgbColor);
    // this.setState({
    //   editorState: newState, 
    //   pickerColor: color.hex
    // });

    this.domEditor.focusEditor();
    setTimeout(
      function() {
        const newState = toggleCustomInlineStyle(this.state.editorState, 'color', this.state.pickerColor);
        this.setState({
          editorState: newState,
          showColorPicker: false
        });
      }
      .bind(this),
      500
    );
  }
  handleChangeComplete = (color) => {
    const rgbColor=`RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
      this.setState({pickerColor: rgbColor});
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
                  <Avatar
                    src={`${RESTAPIUrl}/public/profile/${this.props.signedInUser.profile_image}?${this.props.imageHash}`}
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
                    <img alt="Arrow, person, profile, right, user icon" className="n3VNCb" src={`${RESTAPIUrl}/public/find-user.webp`} />
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
                      disabled={typeof this.props.targetUser.id == 'undefined' ? true : false }
                    >
                      <Icon path={mdiPhone}
                        size={1}
                        horizontal
                        vertical
                        rotate={180}
                      />
                    </MDBBtn>
                    
                    <MDBBtn 
                      className="action-btn video" 
                      color="primary"
                      onClick={this.callWithVideo.bind(this, true)}
                      disabled={typeof this.props.targetUser.id == 'undefined' ? true : false }
                    >
                      <Icon path={mdiVideoOutline}
                        size={1}
                        horizontal
                        vertical
                        rotate={180}
                      />
                    </MDBBtn>
                    
                    <MDBDropdown>
                      <MDBDropdownToggle caret color="primary" className="action-btn">
                        <Icon path={mdiDotsVertical}
                          size={1}
                          horizontal
                          vertical
                        />
                      </MDBDropdownToggle>
                      <MDBDropdownMenu basic>
                        <MDBDropdownItem
                          onClick={()=> {this.props.onProfileModalShow(true)}}
                        >
                          Your Profile
                        </MDBDropdownItem>
                        <MDBDropdownItem
                          onClick={()=> {this.props.onSearchSettingModalShow(true)}}
                        >
                          Search Setting
                        </MDBDropdownItem>

                        <MDBDropdownItem
                          onClick={()=> {this.props.onReportModalShow(true)}}
                          disabled={typeof this.props.targetUser.id == 'undefined' ? true : false }
                        >
                          Report
                        </MDBDropdownItem>
                        
                        
                        <MDBDropdownItem divider />
                        
                        <MDBDropdownItem
                          onClick={this.props.logOut}
                        >
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
                  toBottomHeight={"300"}
                  dataSource={this.props.targetUser.messages}
                  downButton={true}
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
                        icon="palette" 
                        size="lg"
                        onClick={this.toggle_toolbar.bind(this)}
                        className="font-selector mr-1 toggle-icon"
                      />
                      
                      <Editor
                        ref={this.setDomEditorRef}
                        editorState={this.state.editorState}
                        placeholder="Type a message...123"
                        wrapperClassName="demo-wrapper"
                        toolbarClassName={this.state.toolbar_show ? '' : 'toggle-toolbar'}
                        editorClassName="demo-editor"
                        keyBindingFn={this.keyBindingFunction.bind(this)}
                        onEditorStateChange={this.onEditorStateChange}
                        // onChange={this.onEditorChange.bind(this)}
                        toolbar={{
                          options: ['inline', 'colorPicker', 'fontSize', 'fontFamily',],
                          inline: { 
                              inDropdown: false, 
                              options: ['bold', 'italic', 'underline'], 
                          },
                          image: { uploadEnabled: true},
                          inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                          fontSize: {
                            options: [8, 9, 10, 11, 12, 14, 16, 18, 20]
                          },
                        }}
                      />
                      
                      {this.state.showColorPicker ? 
                      <div>
                        <SketchPicker 
                          color={ this.state.pickerColor }
                          onChangeComplete={ this.handleChangeComplete.bind(this) }
                        />
                        <button className="color-confirm" onClick={this.onApplyColorPicker.bind(this)}>Apply</button>
                        <button className="color-cancel" onClick={this.hideColorPicker.bind(this)}>Cancel</button>
                        <div className="color-picker-hide" onClick={this.hideColorPicker.bind(this)}></div>
                      </div>
                      :
                      null}
                      

                      {this.state.toolbar_show ? 
                        <button className="color-picker-toggle" onClick={this.toggleColorPicker.bind(this)}>
                          <i className="fas fa-eye-dropper"></i>
                        </button>
                      : null}
                      
                      

                      
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
                          {/* <FontAwesomeIcon icon={faPaperPlane} color="white" /> */}
                          {/* <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="paper-plane" class="svg-inline--fa fa-paper-plane fa-w-16 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" color="white"><path fill="currentColor" d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"></path></svg> */}
                          <svg className="jss4" focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation"><path fill="#fff" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path><path fill="none" d="M0 0h24v24H0z"></path></svg>
                        </div>
                      </InputGroup.Button>

                  </Row>
                </FormGroup>
              </div>
            ) : (
              <div className="waiting-container">
                <div className="title-box">
                  <h2>Welcome, {this.props.signedInUser.userName}!</h2><br></br>
                </div>
                <div className="body-box">
                  <p 
                    className="select-friend"
                    onClick={this.findTargetUser.bind(this)}
                  >
                      Select a friend to start a chat.
                  </p>
                </div>
              </div>
            )}
          </div>
        
          <Picker 
            style={this.state.showEmojiPicker? { position: 'absolute', bottom: '90px', right: '10px', opacity: '1' } : { position: 'absolute', bottom: '90px', right: '10px', opacity: '0', zIndex:'-3' }} 
            onSelect={this.addEmoji.bind(this)} 
            emojiTooltip={true}
          />

        { this.state.showEmojiPicker ? (
          <div>            
            <div className="emoji-back" onClick={this.closeEmojiPicker.bind(this)}></div>
          </div>
        ): null }       
        
      </div>
    );
  }
}
