import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { RESTAPIUrl } from "../../config/config";
import "./CallWindow.css";

const getButtonClass = (icon, enabled) => classnames(`btn-action fa ${icon}`, { disable: !enabled });

function CallWindow({ peerSrc, localSrc, config, mediaDevice, status, endCall }) {
  const peerVideo = useRef(null);
  const localVideo = useRef(null);
  const [video, setVideo] = useState(config.video);
  const [audio, setAudio] = useState(config.audio);
  const [ toggleVideo, setToggleVideo ] = useState(true);

  useEffect(() => {
    if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
    if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
  },[peerSrc, localSrc]);

  useEffect(() => {
    if (mediaDevice) {
      mediaDevice.toggle('Video', video);
      mediaDevice.toggle('Audio', audio);
    }
  });

  /**
   * Turn on/off a media device
   * @param {String} deviceType - Type of the device eg: Video, Audio
   */
  const toggleMediaDevice = (deviceType) => {
    if (deviceType === 'video') {
      setVideo(!video);
      mediaDevice.toggle('Video');
    }
    if (deviceType === 'audio') {
      setAudio(!audio);
      mediaDevice.toggle('Audio');
    }
  };

  const toggleVideoContact = () => {
    setToggleVideo(!toggleVideo);
  }

  return (
    <div className={classnames('call-window', status)}>
      <div className="video-contact">
        <video id="peerVideo" className={`${toggleVideo? 'max-video':'min-video'}`} ref={peerVideo} autoPlay />

        <div 
          className={`toggle-contact-video ${toggleVideo? 'max-mark':'min-mark'}`}
          onClick={() => toggleVideoContact()}
        >
          <img src={`${RESTAPIUrl}/public/${toggleVideo? 'min' : 'max'}.png`}></img>
        </div>
      </div>

      <div className="video-user">
        <video id="localVideo" ref={localVideo} autoPlay muted />        
      </div>      
      
      <div className="video-control">
        <button
          key="btnVideo"
          type="button"
          className={getButtonClass('fa-video', video)}
          onClick={() => toggleMediaDevice('video')}
        />
        <button
          key="btnAudio"
          type="button"
          className={getButtonClass('fa-microphone', audio)}
          onClick={() => toggleMediaDevice('audio')}
        />
        <button
          type="button"
          className="btn-action hangup fa fa-phone"
          onClick={() => endCall(true)}
        />
      </div>
    </div>
  );
}

CallWindow.propTypes = {
  status: PropTypes.string.isRequired,
  localSrc: PropTypes.object, // eslint-disable-line
  peerSrc: PropTypes.object, // eslint-disable-line
  config: PropTypes.shape({
    audio: PropTypes.bool.isRequired,
    video: PropTypes.bool.isRequired
  }).isRequired,
  mediaDevice: PropTypes.object, // eslint-disable-line
  endCall: PropTypes.func.isRequired
};

export default CallWindow;
