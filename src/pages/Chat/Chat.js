import React, { Component } from "react";
import ChatBox from "../../components/ChatBox";
import OnTyping from "../../components/OnTyping/OnTyping";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import FullScreenImage from "../../components/FullScreenImage/FullScreenImage";
import SearchSettingBox from "../../components/SearchSettingBox/SearchSettingBox";
import ReportBox from "../../components/ReportBox/ReportBox";
import ErrorModal from "../../components/ErrorModal";
import LoadingModal from "../../components/LoadingModal";
import "react-chat-elements/dist/main.css";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import axios from "axios";
import { getFromStorage } from '../../utils/storage';
import jwt_decode from "jwt-decode";

import renderHtml from 'react-render-html';
import { RESTAPIUrl } from "../../config/config";
import "./Chat.css";
/**
 * Fetches socket server URL from env
 */
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@
import _ from 'lodash';
import socket from './socket';
import PeerConnection from './PeerConnection';
// import MainWindow from './MainWindow';
// import CallWindow from './CallWindow';
// import CallModal from './CallModal';
import CallWindow from '../../components/CallWindow/CallWindow';
import CallModal from '../../components/CallModal/CallModal';
import { MDBBtn } from "mdbreact";
/**
 * App Component
 *
 * initiaites Socket connection and handle all cases like disconnected,
 * reconnected again so that user can send messages when he is back online
 *
 * handles Error scenarios if requests from Axios fails.
 *
 */

//  Get the token information from local storage and get user's information using decode
const obj = getFromStorage('guest_signin');
if(obj && obj.token) {
    var decoded_token = jwt_decode(obj.token);
    var signedInUser = decoded_token.user;
}


class App extends Component {
  socket = null;
  constructor() {
    super();

    const obj = getFromStorage('guest_signin');
    if(obj && obj.token) {
        var decoded_token = jwt_decode(obj.token);
        var signedInUser = decoded_token.user;
    }

    this.state = {
      signInModalShow: false,
      users: [], // Avaiable users for signing-in
      userChatData: {}, // this contains users from which signed-in user can chat and its message data.
      user: null, // Signed-In User
      selectedUserIndex: 1,
      profileModalShow: '',
      searchModalShow: '',
      reportModalShow: '',
      error: false,
      errorMessage: "",
      targetUser: '',
      blackUsersList: [signedInUser._id],
      signedInUser: signedInUser,
      searchSetting: {
        location: '',
        gender: '',
        ageMin: 13,
        ageMax: 99,
      },
      onTyping: false,
      showImageFullScreen: false,
      confirmRemoveOldSession: false,
      imageHash: Date.now(),

      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      // clientId: '',
      callWindow: '',
      callModal: '',
      callFrom: '',
      localSrc: null,
      peerSrc: null,

      config: null,
    
    };


    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    this.pc = {};
    // this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
  }
  
  
  /**
   *
   * Setups Axios to monitor XHR errors.
   * Initiates and listen to socket.
   * fetches User's list from backend to populate.
   */

  componentDidMount() {
    this.verifyAccount();
    // this.initAxios();
    this.initSocketConnection();
    this.createSocketRoom();
    this.setupSocketListeners();
  }

  componentDidUpdate() {
    var imgObj = document.getElementsByTagName("img");
    let that = this;
    for (var i = 0 ; i < imgObj.length; i++) {
      imgObj[i].addEventListener('click' , function() {
        if(this.hasAttribute('data_group')) {
          console.log("this is attach file property", this.attributes.getNamedItem("src").value)
          
          that.setState({
            showImageFullScreen: true,
            attachFileUrl: this.attributes.getNamedItem("src").value
          });
        }

      }) ; 
    }
  }

  verifyAccount() {
    const obj = getFromStorage('guest_signin');
    
    fetch(RESTAPIUrl + '/api/guest/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: obj.token
      }),
    })
    .then(res =>res.json())
    .then(json => {
      if(!json.status) {
        localStorage.clear();
        this.props.history.push("/");
      }
    })
  }

  initSocketConnection() {
    // this.socket = io.connect(SOCKET_URI);
    this.socket = socket;
  }

  /**
   *
   * Checks if request from axios fails
   * and if it does then shows error modal.
   */
  initAxios() {
    axios.interceptors.request.use(
      config => {
        this.setState({ loading: true });
        return config;
      },
      error => {
        this.setState({ loading: false });
        this.setState({
          errorMessage: `Couldn't connect to server. try refreshing the page.`,
          error: true
        });
        return Promise.reject(error);
      }
    );
    axios.interceptors.response.use(
      response => {
        this.setState({ loading: false });
        return response;
      },
      error => {
        this.setState({ loading: false });
        this.setState({
          errorMessage: `Some error occured. try after sometime`,
          error: true
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   *
   * Shows error if client gets disconnected.
   */
  onClientDisconnected() {
    NotificationManager.error(
      "Connection Lost from server please check your connection.",
      "Error!"
    );
  }

  /**
   *
   * Established new connection if reconnected.
   */
  onReconnection() {
    if (this.state.user) {
      this.socket.emit("sign-in", this.state.user);
      NotificationManager.success("Connection Established.", "Reconnected!");
    }
  }

  /**
   *
   * Create room when user enter chat router
   */
  createSocketRoom() {
    this.socket.emit("create_room", this.state.signedInUser);
  }

  /**
   *
   * Get target user to chat
   */
  findTargetUser() {
    let findTargetQuery = {
        blackUsersList: this.state.blackUsersList,
        searchSetting: this.state.searchSetting,
        signedInUser: this.state.signedInUser,
        prevTargetUser: this.state.targetUser,
    };
    this.socket.emit("find_target", findTargetQuery);
  }

  onRemoveOldSession() {
    this.setState({
      confirmRemoveOldSession: true,
      targetUser: '',
      userChatData: {}
    },() => {
      this.socket.emit('confirm_remove_old_session', this.state.signedInUser); 
    });       
  }

  onConfirmRemoveOldSession() {
    // this.socket.emit('confirm_remove_old_session', this.state.signedInUser);
    localStorage.clear();
    this.setState({confirmRemoveOldSession: false});
    
    this.props.history.push("/");
  }

  onFindTargetUser(targetUser) {
    // Add current target user to black user list
    let blackUsersList = this.state.blackUsersList;
    blackUsersList.push(targetUser._id);
    this.setState({blackUsersList});
    
    let userChatData = {
        id: targetUser._id,
        name: targetUser.userName,
        profile_image: targetUser.profile_image,
        gender: targetUser.gender,
        location: targetUser.location,
        age: targetUser.age
    }
    
    // this.setState({userChatData});
    this.setState({ userChatData,targetUser }, () => {
      let message = {
        to: this.state.signedInUser._id,
        message: {
          type: "text",
          date: +new Date(),
          text: `<span style="color: blue;">You are now connected to ${this.state.targetUser.userName}<br>${this.state.targetUser.gender} ${this.state.targetUser.age} ${this.state.targetUser.location}</span>`,
          className: "message"
        },
        from: this.state.targetUser._id
      };
      this.socket.emit("message", message);
    });
    
    // This is used for backed global variable (target_id     )
    this.socket.emit("confirm-find_target", this.state.targetUser);
  }

  onSearchNone() {
    NotificationManager.error(
      `Sorry your search did not have any results. Please widen your search`
    );
    this.setState({targetUser: ''});
    this.setState({ userChatData: {}}); 
  }

  onAvailableNone() {
    console.log("already contacted with all users");
    NotificationManager.error(
      `You have already contacted with all online users. Try search again`
    );
    this.setState({targetUser: ''});
    this.setState({ userChatData: {}}); 
  }
  
  onIgnore() {
    // console.log("You are ignored from", this.state.targetUser);
    // Ignored Message handling
    this.setState({targetUser: ''});
    this.setState({ userChatData: {}});
  }
  /**
   *
   * Setup all listeners
   */

  setupSocketListeners() {
    this.socket.on("message", this.onMessageRecieved.bind(this));
    this.socket.on("reconnect", this.onReconnection.bind(this));
    this.socket.on("disconnect", this.onClientDisconnected.bind(this));
    //////
    this.socket.on("remove_old_session", this.onRemoveOldSession.bind(this));
    this.socket.on("find_target", this.onFindTargetUser.bind(this));
    this.socket.on("search-none", this.onSearchNone.bind(this));
    this.socket.on("available-none", this.onAvailableNone.bind(this));
    this.socket.on("ignore", this.onIgnore.bind(this));
    this.socket.on("on-typing", this.onTargetUserTyping.bind(this));
    this.socket.on("target-disconnect", this.onTargetDisconnect.bind(this));
    this.socket.on("target-logout", this.onTargetLogout.bind(this));
    this.socket.on("log-out", this.onLogOut.bind(this));

    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    this.socket
      // .on('init', ({ id: clientId }) => {
      //   document.title = `${clientId} - VideoCall`;
      //   this.setState({ clientId });
      // })

      //@@@@@@@@@@ Remove the callfrom. It's not needed
      .on('request', ({ from: callFrom }) => {
        this.setState({ callModal: 'active', callFrom });
      })
      .on('call', (data) => {
        if (data.sdp) {
          this.pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') this.pc.createAnswer();
        } else this.pc.addIceCandidate(data.candidate);
      })
      .on('end', this.endCall.bind(this, false))
      .emit('init');
  }

  /**
   *
   * @param {MessageRecievedFromSocket} message
   *
   * Triggered when message is received.
   * It can be a message from user himself but on different session (Tab).
   * so it decides which is the position of the message "right" or "left".
   *
   * increments unread count and appends in the messages array to maintain Chat History
   */
  customeRenderAddCamp() {
      // console.log('param');
  }

  onMessageRecieved(message) {
      // console.log("this is message response", message);
    var userChatData = this.state.userChatData;    
    var messageData = message.message;
    var messageDataText = messageData.text;
    
    if(messageDataText === '<p></p>\n')
      return false;
      
    // Handling emoji icon string
    let regexp = /:[\w]+[_]?[-]?[+]*[\w]+:/g;
    let str = messageData.text;

    let array = [...str.matchAll(regexp)];

    for(let i = 0 ; i < array.length ; i++)  {
      let emojiComp = document.querySelector('[title=' + String(array[i]).split(":").join("") +']');
      let emojiHtml = emojiComp.innerHTML;
      messageDataText = messageDataText.replace(String(array[i]), String(emojiHtml));
    }

    // Handling image case
    messageDataText = messageDataText.split("<img").join("<img data_group='attach-file'");

    // let targetId;
    if (message.from === this.state.signedInUser._id) {
      messageData.position = "right";
      messageData.renderAddCmp = () => { return renderHtml(`<div className="message-text message-text-right">${messageDataText}</div>`)};
      // targetId = message.to;
    //   messageData.avatar = `${process.env.REACT_APP_SERVER_URI}/avatar/${this.state.user.id}.jpg`;
      messageData.avatar = `${RESTAPIUrl}/public/profile/${this.state.signedInUser.profile_image}`;
    } else {
      messageData.position = "left";      
      messageData.renderAddCmp = () => { return renderHtml(`<div className="message-text message-text-left">${messageDataText}</div>`)};
      // targetId = message.from;
    //   messageData.avatar = `${process.env.REACT_APP_SERVER_URI}/avatar/${targetId}.jpg`;
      messageData.avatar = `${RESTAPIUrl}/public/profile/${this.state.targetUser.profile_image}`;
    }
    // let targetIndex = userChatData.findIndex(u => u.id === targetId);
    // messageData.renderAddCamp = this.customeRenderAddCamp;
    messageData.alert = false;
    if (!userChatData.messages) {
      userChatData.messages = [];
    } else {
      if(userChatData.messages[userChatData.messages.length-1].alert === true ) {
        userChatData.messages.pop();
      }  
    }
    // console.log(this.state.userChatData.messages[this.state.userChatData.messages.length - 1]);
    let messages = this.state.userChatData.messages;
    if(typeof messages != 'undefined' && messages.length > 0) {
      if(messages[messages.length-1].position === messageData.position) {
        let prevMessageData = messages[messages.length-1];
        prevMessageData.avatar = '';
        prevMessageData.date = '';
        userChatData.messages.pop();
        userChatData.messages.push(prevMessageData);
      }
    }
    userChatData.messages.push(messageData);
    this.setState({ userChatData });
    // console.log("This is state for this component",this.state);


    // Scroll to bottom when receiving the new message
    var element = document.querySelector('[class="rce-mlist"]');
    console.log("this is element error", element,"type", typeof element);
    element.scrollTop = element.scrollHeight;
  }
  /**
   *
   * @param {User} e
   *
   * called when user clicks to sign-in
   */
  onUserClicked(e) {
    let user = e.user;
    this.socket.emit("sign-in", user);
    let userChatData = this.state.users.filter(u => u.id !== user.id);
    this.setState({ user, signInModalShow: false, userChatData });
  }

  /**
   *
   * @param {ChatItem} e
   *
   * handles if user clickes on ChatItem on left.
   */
  onChatClicked(e) {
    let users = this.state.userChatData;
    for (let index = 0; index < users.length; index++) {
      if (users[index].id === e.user.id) {
        users[index].unread = 0;
        this.setState({ selectedUserIndex: index, userChatData: users });
        return;
      }
    }
  }

  /**
   *
   * @param {messageText} text
   *
   * creates message in a format in which messageList can render.
   * position is purposely omitted and will be appended when message is received.
   */
  createMessage(text) {
    let message = {
      to: this.state.targetUser._id,
      message: {
        type: "text",
        text: text,
        date: +new Date(),
        className: "message"
      },
      from: this.state.signedInUser._id
    };
    this.socket.emit("message", message);
  }

  /**
   * Toggles views from 'ChatList' to 'ChatBox'
   *
   * only on Phone
   */

  changeProfile(userInfo) {
    this.setState({signedInUser: userInfo});
  }

  onProfileModalShow(status) {
    this.setState({profileModalShow: status});
  }

  onSearchSettingModalShow(status) {
    this.setState({searchModalShow: status});    
  }
  onReportModalShow(status) {
    this.setState({reportModalShow: status});
  }
  onShowImageFullScreen() {
    this.setState({showImageFullScreen: false});
  }
  
  onTyping() {
    this.socket.emit("on-typing", this.state.targetUser);
  }

  onTargetUserTyping() {
    this.setState({onTyping: true});

    let userChatData = this.state.userChatData;
    let messages = userChatData.messages;
    let messageData = {};
    if(typeof messages != 'undefined'){
      if(messages[messages.length-1].alert !== true || messages.length === 0) {
        messageData.position = "left";      
        messageData.renderAddCmp = () => { return <OnTyping/>};
        messageData.avatar = `${RESTAPIUrl}/public/profile/${this.state.targetUser.profile_image}`;
        messageData.className = "message";
        messageData.alert = true;
        
        if (!userChatData.messages) {
          userChatData.messages = [];
        }
        userChatData.messages.push(messageData);
        this.setState({ userChatData });
        
        this.turnOffRedTimeout = setTimeout(() => {
          userChatData = this.state.userChatData;
          if(userChatData.messages[userChatData.messages.length-1].alert === true) {
            userChatData.messages.pop();
            this.setState({ userChatData });
          }          
        }, 2000);
      } else {
             
      }
    }
    
  }

  onTargetDisconnect() {
    if(this.state.targetUser !== '' || typeof this.state.targetUser.userName !== 'undefined') {
      NotificationManager.error(
        `${this.state.targetUser.userName} disconnected from this chat room.`
      );
    }
    
    this.setState({targetUser: ''});
    this.setState({ userChatData: {}});
    this.socket.emit("confirm-target-disconnect");   
  }

  updateProfile() {
    const obj = getFromStorage('guest_signin');
    if(obj && obj.token) {
        var decoded_token = jwt_decode(obj.token);
        var signedInUser = decoded_token.user;
    }
    this.setState({signedInUser: signedInUser, imageHash:Date.now()});
  }

  closeSettingBox() {
    this.setState({
      profileModalShow: false,
      searchModalShow: false,
      reportModalShow:false,
    })
  }

  logOut() {
    this.socket.emit('log-out', signedInUser);
  }

  onLogOut() {
    localStorage.clear();
    this.props.history.push("/");
  }

  onTargetLogout() {
    NotificationManager.error(
      `${this.state.targetUser.userName} log out.`
    );

    let blackUsersList = this.state.blackUsersList;
    let targetIndex = blackUsersList.indexOf(this.state.targetUser._id);
      blackUsersList.splice(targetIndex, targetIndex+1 );
  
    this.setState({
      targetUser: '',
      userChatData: {},
      blackUsersList: blackUsersList
    });
    this.socket.emit("confirm-target-logout");
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  startCall(isCaller, targetUserID, config) {
    console.log("call start now ", isCaller, targetUserID, config)
    // this.config = config;
    this.setState({config});
    this.pc = new PeerConnection(targetUserID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', (src) => this.setState({ peerSrc: src }))
      .start(isCaller, config);
  }

  rejectCall() {
    const { callFrom } = this.state;
    this.socket.emit('end', { to: callFrom });
    this.setState({ callModal: '' });
  }

  endCall(isStarter) {
    if (_.isFunction(this.pc.stop)) {
      this.pc.stop(isStarter);
    }
    this.pc = {};
    // this.config = null;
    this.setState({
      callWindow: '',
      callModal: '',
      localSrc: null,
      peerSrc: null,
      config: null
    });
  }
  
  
  render() {
    // @@@@@@@@@@@@@@@@@@@@@@@@@@
    const { callModal, callWindow, localSrc, peerSrc } = this.state;
    return (
      <div>
        {/* <button onClick={this.findTargetUser.bind(this)}>Next stranger</button> */}
        
        <ChatBox
          signedInUser={this.state.signedInUser}
          imageHash={this.state.imageHash}
          onSendClicked={this.createMessage.bind(this)}
          targetUser={
            this.state.userChatData
          }
          onProfileModalShow={this.onProfileModalShow.bind(this)}
          onSearchSettingModalShow={this.onSearchSettingModalShow.bind(this)}
          onReportModalShow={this.onReportModalShow.bind(this)}
          findTargetUser={this.findTargetUser.bind(this)}
          onTyping={this.onTyping.bind(this)}
          startCall={this.startCallHandler}
          logOut={this.logOut.bind(this)}
        />
        
        <ErrorModal
          show={this.state.error}
          errorMessage={this.state.errorMessage}
        />

        <LoadingModal show={this.state.loading} />
        <NotificationContainer />        
        
        <ProfileBox 
          profileInfo={this.state.signedInUser}
          iamgeHash={this.state.imageHash}
          onChangeProfile={this.changeProfile.bind(this)}
          onProfileModalShow={this.onProfileModalShow.bind(this)}
          profileContainer={ `profile-container-${this.state.profileModalShow}` }
          updateProfile={this.updateProfile.bind(this)}
        />
        <SearchSettingBox
          searchContainer={ `search-container-${this.state.searchModalShow}` }
          searchSetting={this.state.searchSetting}
          onSearchSettingModalShow={this.onSearchSettingModalShow.bind(this)}
        />

        <ReportBox
          reportContainer={ `report-container-${this.state.reportModalShow}` }
          onReportModalShow={this.onReportModalShow.bind(this)}
          signedInUser={this.state.signedInUser}
          targetUser={this.state.targetUser}
        />

        { this.state.reportModalShow || this.state.profileModalShow || this.state.searchModalShow ? (
          <div>            
            <div className="setting-back" onClick={this.closeSettingBox.bind(this)}></div>
          </div>
        ): null } 

        {this.state.showImageFullScreen ? 
          <FullScreenImage 
            imageUrl={this.state.attachFileUrl}
            onShowImageFullScreen={this.onShowImageFullScreen.bind(this)}
          />
          : null
        }

        {/* {!_.isEmpty(this.state.config) && (
          <CallWindow
            status={callWindow}
            localSrc={localSrc}
            peerSrc={peerSrc}
            config={this.state.config}
            mediaDevice={this.pc.mediaDevice}
            endCall={this.endCallHandler}
          />
        ) } */}

<CallWindow
            status={callWindow}
            localSrc={localSrc}
            peerSrc={peerSrc}
            config={this.state.config}
            mediaDevice={this.pc.mediaDevice}
            endCall={this.endCallHandler}
          />
        
        {this.state.targetUser ? (
          <CallModal
            status={callModal}
            startCall={this.startCallHandler}
            rejectCall={this.rejectCallHandler}
            callFrom={this.state.targetUser._id}
            contactUser={this.state.targetUser.userName}
            userAvatar={this.state.targetUser.profile_image}
          />
        ): null}

        {this.state.confirmRemoveOldSession ? (
          <div>
            <div className="hide-comp"></div>
            <div className="close-window">
              <span>You are signed in another location and disconnect old session.</span>
              <div className="button-wrapper">
                <MDBBtn
                  size="sm"
                  color="primary"
                  onClick={this.onConfirmRemoveOldSession.bind(this)}
                >
                  Confirm
                </MDBBtn>
              </div> 
            </div>
          </div>
        ):
        null
        } 

      </div>
    );
  }
}

export default App;
