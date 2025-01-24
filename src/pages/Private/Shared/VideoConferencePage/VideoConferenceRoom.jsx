import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "peerjs";
import { AiOutlineAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { MoonLoader } from "react-spinners";
import { useMicVAD } from "@ricky0123/vad-react";
import { v4 } from "uuid";
import "./VideoConferencePage.scss";
import { UserDataContext } from "../../../../contexts/UserDataContext";
import Video from "../../../../components/VideoChat/VideoChat";
import Chat from "../../../../components/Chat/Chat";
import { PEERJS_SERVER, SOCKETIO_SERVER } from "../../../../api/settings";
import { getCourseByLink } from "../../../../api/getCourseByLink";
import { getMyCourses } from "../../../../api/getMyCourses";
import { toast } from "react-toastify";
import { DictionaryContext } from "../../../../contexts/DictionaryContext";
import { FiMic } from "react-icons/fi";
import { MdArrowDropDown } from "react-icons/md";
import { GiCheckMark } from "react-icons/gi";
import { HiOutlineSpeakerWave } from "react-icons/hi2";

const VideoConferenceRoom = () => {
  const { roomId } = useParams();
  const { userData } = useContext(UserDataContext);
  const { dictionary, language } = useContext(DictionaryContext);
  const peer = useRef();
  const socket = useRef();
  const [members, setMembers] = useState([]);
  const [joint, setJoint] = useState(false);
  const [chat, showChat] = useState(false);
  const [newMsg, setNewMsg] = useState(false);
  const [user, setUser] = useState({ name: "" });
  const userRef = useRef(user);
  const [micOn, setMicOn] = useState();
  const [videoOn, setVideoOn] = useState();
  const [course, setCourse] = useState();
  const [purchasedCourses, setPurchasedCourses] = useState();
  const [host, setHost] = useState();
  const [purchased, setPurchased] = useState();
  const [passcode, setPasscode] = useState("");
  const [cameraId, setCameraId] = useState("");
  const [micId, setMicId] = useState("");
  const [speakerId, setSpeakerId] = useState("");

  const joinRoom = () => {
    socket.current.emit('join-room', {
      roomId,
      peerId: peer.current.id,
      user: userRef.current
    })
  }

  const getCourseInfo = async () => {
    const { ok, data } = await getCourseByLink(roomId);
    if (ok) {
      setCourse(data.data);
      setPasscode(data.data.conference.ZoomPassword);
    }
  }
  const getPurchasedCourses = async () => {
    const { ok, data } = await getMyCourses();
    if (ok) {
      setPurchasedCourses(data.data);
    }
  };

  useEffect(() => {
    getCourseInfo();
    getPurchasedCourses();
    socket.current = io(SOCKETIO_SERVER, {
      transports: ['websocket']
    });
    socket.current.on("all-users", (users) => {
      setMembers(users);
      setJoint(true);
    })
    
    checkPermission("camera", setVideoOn);
    checkPermission("microphone", setMicOn);
  }, [])

  useEffect(() => {
    if (course && userData.info) {
      const host = course.instructor.email === userData.info.email;
      setHost(host);
      peer.current = new Peer(host ? roomId : v4(), { host: PEERJS_SERVER });
    }
  }, [course, userData.info]);

  useEffect(() => {
    if (course && purchasedCourses) {
      const coincidences = purchasedCourses.filter(
        (purchasedCourse) => purchasedCourse.attributes.curso.data.id === course.id
      ).length;
      setPurchased(coincidences ? true : false);
    }
  }, [course, purchasedCourses])

  useEffect(() => {
    userRef.current = user;
  }, [user])

  useEffect(() => {
    if (host === false && purchased === false) {
      toast.warning(dictionary.conferencePage[18][language])
    }
  }, [host, purchased]);
  
  useEffect(() => {
    if (userData.info) {
      setUser({
        ...user, 
        avatar: userData.avatar?.url, 
        name: ((userData.info.nombre ?? "") + " " + (userData.info.apellidos ?? "")).trim()
      });
    }
  }, [userData.info])

  return (
    <div className="room">
      {(joint) && members.length ? (
        <>
          <div className="videos">
            <Video
              roomId={roomId}
              socket={socket}
              user={userRef.current}
              peer={peer}
              members={members}
              setMembers={setMembers}
              showChat={showChat}
              newMsg={!chat && newMsg}
              mic={micOn}
              video={videoOn}
              micId={micId}
              setMicId={setMicId}
              cameraId={cameraId}
              setCameraId={setCameraId}
              style={{width: `calc(100% - ${chat?"20rem":"0"})`}}
            />
          </div>
          <div className="chat" style={{display: chat?"flex":"none"}}>
            <Chat user={userRef.current} roomId={roomId} peerId={peer.current?.id} socket={socket} setNewMsg={setNewMsg} />
          </div>
        </>
      ) : (
        <PrepareMeeting
          user={user}
          micOn={micOn}
          setMicOn={setMicOn}
          videoOn={videoOn}
          setVideoOn={setVideoOn}
          micId={micId}
          setMicId={setMicId}
          cameraId={cameraId}
          setCameraId={setCameraId}
          speakerId={speakerId}
          setSpeakerId={setSpeakerId}
          onAction={joinRoom} 
          disable={!host && !purchased}
          // passcode={host ? "" : passcode}
          actionText={"Join conference"}
        />
      )}
    </div>
  )
}
export default VideoConferenceRoom;

export const PrepareMeeting = ({user, onAction, actionText, micOn, setMicOn, videoOn, setVideoOn, cameraId, setCameraId, micId, setMicId, speakerId, setSpeakerId, passcode, disable}) => {
  const ref = useRef();
  const { dictionary, language } = useContext(DictionaryContext);
  const [spinner, setSpinner] = useState(false);
  const [init, setInit] = useState(false);
  const [code, setCode] = useState("");
  const [mediaDevices, setMediaDevices] = useState([]);

  const toggleMic = () => {
    if (micOn) {
      removeStream(ref, "audio")
      setMicOn(false);
    } else {
      navigator.mediaDevices
      .getUserMedia({video: false, audio:{
        deviceId: micId
      }})
      .then(device => {
        addStream(ref, device, "audio")
        setMicOn(true);
        navigator.mediaDevices.enumerateDevices().then(infos => setMediaDevices(infos));
      })
    }
  }
  const toggleVideo = () => {
    if (videoOn) {
      removeStream(ref, "video")
      setVideoOn(false);
    } else {
      navigator.mediaDevices
      .getUserMedia({video: {
        deviceId: cameraId
      }, audio:false})
      .then(device => {
        addStream(ref, device, "video")
        setVideoOn(true);
        navigator.mediaDevices.enumerateDevices().then(infos => setMediaDevices(infos));
      })
    }
  }
  useEffect(() => {
    setMicOn(false)
    // if (micId && micOn) {
    //   navigator.mediaDevices
    //   .getUserMedia({video: false, audio:{
    //     deviceId: micId
    //   }})
    //   .then(device => {
    //   console.log("micId, micOn", micId, micOn, device.getAudioTracks()[0].getSettings().deviceId)
    //     addStream(ref, device, "audio")
    //   })
    // }
  }, [micId])
  useEffect(() => {
    if (cameraId && videoOn) {
      navigator.mediaDevices
      .getUserMedia({video: {
        deviceId: cameraId
      }, audio:false})
      .then(device => {
        addStream(ref, device, "video")
      })
    }
  }, [cameraId])

  useEffect(() => {
    if (speakerId) {
      navigator.mediaDevices.selectAudioOutput({deviceId:speakerId});
    }
  }, [speakerId])

  useEffect(() => {
    if (micOn !== undefined || videoOn !== undefined) {
      if (!init) {
        navigator.mediaDevices
        .getUserMedia({video: videoOn !== undefined ? {
          deviceId: cameraId
        }:false, audio: micOn !== undefined?{
          deviceId: micId
        }:false})
        .then(device => {
          addStream(ref, device)
          setVideoOn(videoOn !== undefined ? true : undefined);
          setMicOn(micOn !== undefined ? true : undefined);
          navigator.mediaDevices.enumerateDevices().then(infos => setMediaDevices(infos));
        });
      }
      setInit(true);
    }
  }, [micOn, videoOn])

  return (
    <div className="home-container">
      <div className="video-container">
        <video ref={ref} autoPlay muted style={{visibility: videoOn ? "visible" : "hidden"}}/>
        <div className="button-group">
          <button onClick={toggleMic} className={micOn?"on":null}>
            {micOn ? <AiOutlineAudio color="white"/>:<AiOutlineAudioMuted color="white"/>}
            {(micOn === undefined) && (<i>!</i>)}
          </button>
          <button onClick={toggleVideo} className={videoOn?"on":null}>
            {videoOn ? <BsCameraVideo color="white"/>:<BsCameraVideoOff color="white"/>}
            {videoOn === undefined && <i>!</i>}
          </button>
        </div>
        {micOn && (
          <div className={"voice-detector"} key={micId}>
            <VoiceDetector color="white" count={3} stream={ref.current?.captureStream()}/>
          </div>
        )}
        {mediaDevices.length > 0 && (
          <div className="device-select">
            <DeviceSelect list={mediaDevices.filter(m => m.kind === 'audioinput' && m.deviceId.length > 20)} value={micId} setValue={setMicId} icon={<FiMic size={22}/>}/>
            <DeviceSelect list={mediaDevices.filter(m => m.kind === 'audiooutput' && m.deviceId.length > 20)} value={speakerId} setValue={setSpeakerId} icon={<HiOutlineSpeakerWave size={22}/>}/>
            <DeviceSelect list={mediaDevices.filter(m => m.kind === 'videoinput' && m.deviceId.length > 20)} value={cameraId} setValue={setCameraId} icon={<BsCameraVideo size={22}/>}/>
          </div>
        )}
      </div>
      <div className="action-group">
        <h3>{dictionary.conferencePage[17][language]}</h3>
        <p>{user.name}</p>
        {
          passcode && (
            <input placeholder="Passcode" value={code} onChange={(e) => setCode(e.target.value)}/>
          )
        }
        <button disabled={disable || (passcode && passcode !== code) || spinner} onClick={() => {
          setSpinner(true);
          onAction();
          removeStream(ref);
        }}>{actionText}</button>
        { spinner && <div className="spinner"><MoonLoader color="#004dfd" size={32}/></div>}
      </div>
    </div>
  )
}

const DeviceSelect = ({list, value, setValue, icon}) => {
  const [label, setLabel] = useState();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (list.length) {
      setLabel(list[Math.max(0, list.findIndex(item => item.deviceId === value))]?.label)
    }
  }, [list])

  return <div className="select-container" onClick={() => setOpen(prev => !prev)} onMouseLeave={() => setOpen(false)}>
    <div className="value-container">{icon}<span>{label}</span><MdArrowDropDown size={24}/></div>
    <div className={`options-container ${open && "open-dropdown"}`}>
      {list.map(item => (
        <div key={item.deviceId} className="option" onClick={() => {
          setValue(item.deviceId)
          setLabel(item.label)
        }}> <span>{item.label}</span> {item.label === label && <GiCheckMark color="blue" size={20}/>}</div>
      ))}
    </div>
  </div>
}

export const VoiceDetector = ({gap, color, count, startOnLoad = true, load, onSpeechStart, onSpeechEnd, stream}) => {
  const [loading, setLoading] = useState(false);
  useMicVAD({
    model: "v5",
    userSpeakingThreshold: 1,
    startOnLoad,
    baseAssetPath: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.21/dist/",
    onnxWASMBasePath: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/",
    minSpeechFrames: 1,
    stream,
    onSpeechStart: () => {
      setLoading(true);
      onSpeechStart && onSpeechStart();
    },
    onSpeechEnd: () => {
      setLoading(false);
      onSpeechEnd && onSpeechEnd();
    },
  });
  
  return (
    <div
      className={`voice-detector-container ${loading || load ? "loading":""}`}
      style={{gap: gap ?? ""}}
    >
      {new Array(count ?? 3).fill(1).map((_, index) => <i key={index} style={{color: color ?? "", animationDelay: `${index * 0.2}s`}}></i>)}
    </div>
  )
}

export const checkPermission = (name, setState) => {
  navigator.permissions
    .query({name})
    .then(status => {
      switch (status.state) {
        case `denied`:
        case `prompt`:
          setState(undefined);
          break;
        case `granted`:
        default:
          setState(false);
          break;
      }
    })
}

export const addStream = (ref, stream, videoOrAudio) => {
  if (ref.current.srcObject) {
    if (videoOrAudio === "video") {
      ref.current.srcObject.getVideoTracks().forEach(track => {
        track.stop();
        ref.current.srcObject.removeTrack(track);
      });
      ref.current.srcObject.addTrack(stream.getVideoTracks()[0]);
    } else if (videoOrAudio === "audio") {
      ref.current.srcObject.getAudioTracks().forEach(track => {
        track.stop();
        ref.current.srcObject.removeTrack(track);
      });
      ref.current.srcObject.addTrack(stream.getAudioTracks()[0]);
    } else {
      ref.current.srcObject.getTracks().forEach(track => {
        track.stop();
        ref.current.srcObject.removeTrack(track);
      });
      ref.current.srcObject = stream;
    }
  } else {
    ref.current.srcObject = stream;
  }
}

export const removeStream = (ref, videoOrAudio) => {
  if (ref.current?.srcObject) {
    if (videoOrAudio === "video") {
      ref.current.srcObject.getVideoTracks().forEach(track => {
        track.stop();
        ref.current.srcObject.removeTrack(track);
      });
    } else if (videoOrAudio === "audio") {
      ref.current.srcObject.getAudioTracks().forEach(track => {
        track.stop();
        ref.current.srcObject.removeTrack(track);
      });
    } else {
      ref.current.srcObject.getTracks().forEach(track => {
        track.stop();
        ref.current.srcObject.removeTrack(track);
      });
    }
  }
}