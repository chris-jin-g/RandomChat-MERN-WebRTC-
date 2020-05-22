import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import "./CallWindow.css";

// const getButtonClass = (icon, enabled) => classnames(`btn-action fa ${icon}`, { disable: !enabled });

// function CallWindow({ peerSrc, localSrc, config, mediaDevice, status, endCall }) {
//   const peerVideo = useRef(null);
//   const localVideo = useRef(null);
//   const [video, setVideo] = useState(config.video);
//   const [audio, setAudio] = useState(config.audio);

//   useEffect(() => {
//     if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
//     if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
//   });

//   useEffect(() => {
//     if (mediaDevice) {
//       mediaDevice.toggle('Video', video);
//       mediaDevice.toggle('Audio', audio);
//     }
//   });

//   /**
//    * Turn on/off a media device
//    * @param {String} deviceType - Type of the device eg: Video, Audio
//    */
//   const toggleMediaDevice = (deviceType) => {
//     if (deviceType === 'video') {
//       setVideo(!video);
//       mediaDevice.toggle('Video');
//     }
//     if (deviceType === 'audio') {
//       setAudio(!audio);
//       mediaDevice.toggle('Audio');
//     }
//   };

//   return (
//     <div className={classnames('call-window', this.props.status)}>
//       <div className="video-contact">
//         <video id="peerVideo" ref={(ref) => { this.peerVideo = ref; }} autoPlay />
//       </div>

//       <div className="video-user">
//         <video id="localVideo" ref={(ref) => { this.localVideo = ref; }} autoPlay muted />  
//       </div>      
      
//       <div className="video-control">
//         <button
//           key="btnVideo"
//           type="button"
//           className={getButtonClass('fa-video', video)}
//           onClick={() => toggleMediaDevice('video')}
//         />
//         <button
//           key="btnAudio"
//           type="button"
//           className={getButtonClass('fa-microphone', audio)}
//           onClick={() => toggleMediaDevice('audio')}
//         />
//         <button
//           type="button"
//           className="btn-action hangup fa fa-phone"
//           onClick={() => endCall(true)}
//         />
//       </div>
//     </div>
//   );
// }


const getButtonClass = (icon, enabled) => classnames(`btn-action fa ${icon}`, { disable: !enabled });

export default class CallWindow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            video: this.props.config.video,
            audio: this.props.config.audio
        }

    }

    componentDidUpdate() {
      if (this.peerVideo.current && this.props.peerSrc) this.peerVideo.current.srcObject = this.props.peerSrc;
      if (this.localVideo.current && this.props.localSrc) this.localVideo.current.srcObject = this.props.localSrc;
      
      if (this.props.mediaDevice) {
        this.props.mediaDevice.toggle('Video', this.state.video);
        this.props.mediaDevice.toggle('Audio', this.state.audio);
      }
    }

    toggleMediaDevice(deviceType) {
      if (deviceType === 'video') {
        this.setState({video:!video});
        this.props.mediaDevice.toggle('Video');
      }
      if (deviceType === 'audio') {
        this.setState({audio:!audio});
        this.props.mediaDevice.toggle('Audio');
      }
    };

    
   

    render() {
      return (
        <div className={classnames('call-window', status)}>
          <div className="video-contact">
            <video id="peerVideo" ref={peerVideo} autoPlay />
          </div>
    
          <div className="video-user">
            <video id="localVideo" ref={localVideo} autoPlay muted />  
          </div>      
          
          <div className="video-control">
            <button
              key="btnVideo"
              type="button"
              className={getButtonClass('fa-video', video)}
              onClick={() => this.toggleMediaDevice.bind(this, 'video')}
            />
            <button
              key="btnAudio"
              type="button"
              className={getButtonClass('fa-microphone', audio)}
              onClick={() => this.toggleMediaDevice.bind(this, 'audio')}
            />
            <button
              type="button"
              className="btn-action hangup fa fa-phone"
              onClick={() => this.props.endCall(true)}
            />
          </div>
        </div>
      );
    }
}