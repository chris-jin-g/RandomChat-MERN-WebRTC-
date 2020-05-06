import React, { Component } from "react";
import NavBar from "../../components/NavBar";
import Grid from "react-bootstrap/lib/Grid";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Modal from "react-bootstrap/lib/Modal";
import ChatBox from "../../components/ChatBox";
import OnTyping from "../../components/OnTyping/OnTyping";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import SearchSettingBox from "../../components/SearchSettingBox/SearchSettingBox";
import ErrorModal from "../../components/ErrorModal";
import LoadingModal from "../../components/LoadingModal";
import "react-chat-elements/dist/main.css";
import io from "socket.io-client";
import { fetchUsers } from "../../dataservice/request";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import axios from "axios";
import { SOCKET_URI } from '../../config/config';
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
    this.state = {
      signInModalShow: false,
      users: [], // Avaiable users for signing-in
      userChatData: '', // this contains users from which signed-in user can chat and its message data.
      user: null, // Signed-In User
      selectedUserIndex: 1,
      signInModalShow: false,
      profileModalShow: false,
      searchModalShow: false,
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

      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      // clientId: '',
      callWindow: '',
      callModal: '',
      callFrom: '',
      localSrc: null,
      peerSrc: null
    
    };


    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    this.pc = {};
    this.config = null;
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
    this.initAxios();
    this.initSocketConnection();
    this.createSocketRoom();
    this.setupSocketListeners();
    // this.findTargetUser();
    console.log("This is signed in user:", this.state.signedInUser);
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
    if(this.state.targetUser) {
        let blackUsersList = this.state.blackUsersList;
        blackUsersList.push(this.state.targetUser._id);
        this.setState({blackUsersList});
    }
    let findTargetQuery = {
        blackUsersList: this.state.blackUsersList,
        searchSetting: this.state.searchSetting,
        signedInUser: this.state.signedInUser,
        prevTargetUser: this.state.targetUser,
    };
    this.socket.emit("find_target", findTargetQuery);
  }

  onFindTargetUser(targetUser) {
    console.log("this is target user",targetUser);    
    let userChatData = {
        id: targetUser._id,
        name: targetUser.userName,
        profile_image: targetUser.profile_image,
        gender: targetUser.gender,
        location: targetUser.location,
        age: targetUser.age
    }
    this.setState({ targetUser });
    this.setState({userChatData});
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
    this.socket.on("find_target", this.onFindTargetUser.bind(this));
    this.socket.on("ignore", this.onIgnore.bind(this));
    this.socket.on("on-typing", this.onTargetUserTyping.bind(this));


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
    let userChatData = this.state.userChatData;
    let messageData = message.message;
    let targetId;
    if (message.from === this.state.signedInUser._id) {
      messageData.position = "right";
      messageData.renderAddCmp = () => { return renderHtml(`<div className="message-text message-text-right">${message.message.text}</div>`)};
      targetId = message.to;
    //   messageData.avatar = `${process.env.REACT_APP_SERVER_URI}/avatar/${this.state.user.id}.jpg`;
      messageData.avatar = `${RESTAPIUrl}/public/profile/${this.state.signedInUser.profile_image}`;
    } else {
      messageData.position = "left";      
      messageData.renderAddCmp = () => { return renderHtml(`<div className="message-text message-text-left">${message.message.text}</div>`)};
      targetId = message.from;
    //   messageData.avatar = `${process.env.REACT_APP_SERVER_URI}/avatar/${targetId}.jpg`;
      messageData.avatar = `${RESTAPIUrl}/public/profile/${this.state.targetUser.profile_image}`;
    }
    // let targetIndex = userChatData.findIndex(u => u.id === targetId);
    // messageData.renderAddCamp = this.customeRenderAddCamp;
    messageData.alert = false;

    if (!userChatData.messages) {
      userChatData.messages = [];
    } else {
      if(userChatData.messages[userChatData.messages.length-1].alert == true ) {
        userChatData.messages.pop();
      }  
    }
    // console.log(this.state.userChatData.messages[this.state.userChatData.messages.length - 1]);
    let messages = this.state.userChatData.messages;
    if(typeof messages != 'undefined' && messages.length > 0) {
      if(messages[messages.length-1].position == messageData.position) {
        let prevMessageData = messages[messages.length-1];
        prevMessageData.avatar = '';
        prevMessageData.date = '';
        userChatData.messages.pop();
        userChatData.messages.push(prevMessageData);
      }
    }
    userChatData.messages.push(messageData);
    this.setState({ userChatData });
    console.log("This is state for this component",this.state);
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
  
  onTyping() {
    this.socket.emit("on-typing", this.state.targetUser);
  }

  onTargetUserTyping() {
    this.setState({onTyping: true});

    let userChatData = this.state.userChatData;
    let messages = userChatData.messages;
    let messageData = {};
    let targetId = this.state.targetUser._id;
    if(typeof messages != 'undefined'){
      if(messages[messages.length-1].alert != true || messages.length == 0) {
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
          if(userChatData.messages[userChatData.messages.length-1].alert == true) {
            userChatData.messages.pop();
            this.setState({ userChatData });
          }          
        }, 2000);
      } else {
        console.log("@@@@@@@***********")        
      }
    }
    
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  startCall(isCaller, targetUserID, config) {
    console.log("call start now ", isCaller, targetUserID, config)
    this.config = config;
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
    this.config = null;
    this.setState({
      callWindow: '',
      callModal: '',
      localSrc: null,
      peerSrc: null
    });
  }
  
  render() {
    let chatBoxProps =  {
          xs: 12,
          sm: 12
        };
    

    // @@@@@@@@@@@@@@@@@@@@@@@@@@
    const { clientId, callFrom, callModal, callWindow, localSrc, peerSrc } = this.state;
    return (
      <div>
        {/* <button onClick={this.findTargetUser.bind(this)}>Next stranger</button> */}
        
        <ChatBox
          signedInUser={this.state.signedInUser}
          onSendClicked={this.createMessage.bind(this)}
          targetUser={
            this.state.userChatData
          }
          onProfileModalShow={this.onProfileModalShow.bind(this)}
          onSearchSettingModalShow={this.onSearchSettingModalShow.bind(this)}
          findTargetUser={this.findTargetUser.bind(this)}
          onTyping={this.onTyping.bind(this)}
          startCall={this.startCallHandler}
        />
        
        <ErrorModal
          show={this.state.error}
          errorMessage={this.state.errorMessage}
        />

        <LoadingModal show={this.state.loading} />
        <NotificationContainer />        
        
        <ProfileBox 
          profileInfo={this.state.signedInUser}
          onChangeProfile={this.changeProfile.bind(this)}
          onProfileModalShow={this.onProfileModalShow.bind(this)}
          profileContainer={this.state.profileModalShow ? 'profile-container' : 'profile-container-hide' }         
        />
        <SearchSettingBox
          searchContainer={this.state.searchModalShow ? 'search-container' : 'search-container-hide'}
          searchSetting={this.state.searchSetting}
          onSearchSettingModalShow={this.onSearchSettingModalShow.bind(this)}
        />

        {!_.isEmpty(this.config) && (
          <CallWindow
            status={callWindow}
            localSrc={localSrc}
            peerSrc={peerSrc}
            config={this.config}
            mediaDevice={this.pc.mediaDevice}
            endCall={this.endCallHandler}
          />
        ) }
        <CallModal
          status={callModal}
          startCall={this.startCallHandler}
          rejectCall={this.rejectCallHandler}
          callFrom={this.state.targetUser._id}
        />


      </div>
    );
  }
}

export default App;
