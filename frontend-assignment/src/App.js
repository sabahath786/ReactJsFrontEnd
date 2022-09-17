import "./styles.css";
import React from "react";
import FileSaver from 'file-saver';
import {
  useRecordWebcam,
  CAMERA_STATUS
} from "react-record-webcam";


const OPTIONS = {
  filename: "test-filename",
  fileType: "mp4",
  width: 620,
  height: 500,
  facingMode: "user"
};

export default function App() {
  const [recordDataFromServer, setRecordDataFromServer] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const recordWebcam = useRecordWebcam(OPTIONS);

  /**
   * async method to capture webcam video recording object
   */
  const submitRecordings = async () => {
    setIsAdmin(false);
    const blob = await recordWebcam.getRecording();
    let saving_time = new Date().getTime(); 
    console.log("saving_time : " + saving_time);
    // console.log(process.env.REACT_APP_WEBCAM_VIDEO_RECORDING);
    let fileName = "C:\Users\Saba\Documents\webcam_" + saving_time + ".mp4"
    const file = new File([blob], fileName, { lastModified: saving_time, type: blob.type } );
    FileSaver.saveAs(file);

    console.log({ blob });
    // Client fetch api to post all webcam recording to server db
    await fetch("http://localhost:8000/videodata", {
              method: "POST",
              headers: { 'Content-Type': 'application/json', "Accept": "application/json" },
              body: JSON.stringify({ "name": fileName, "dateModified": saving_time})
            }).then((response) => response.text())
            .then((data) => {
              console.log('Success:', data.toString());
            })
            .catch((error) => {
              console.error('Error:', error);
            });
          
  };


  // method to get all saved recordings from server
  const getRecordings =  async () =>{
    fetch("http://localhost:8000/getsavedvideo")
      .then(response => {
        console.log(response.json);
        return response.json()
      })
      .then(data => {
        console.log(data);
        setRecordDataFromServer(data)
      })
      .catch((error) => {
        console.log(error)
      });
    

      // if(recordDataFromServer){
      //   setIsAdmin(true)
      // }
      // console.log(recordDataFromServer);
  }

  return (
    <div className="webcam_recording_main">
        <div className="webcam_recording_status">
            <span>React Webcam Recording</span>
            <p>Camera status: {recordWebcam.status}</p>
        </div>
      
        <div className="webcam_recording_buttons">
            <button
            disabled={
                recordWebcam.status === CAMERA_STATUS.OPEN ||
                recordWebcam.status === CAMERA_STATUS.RECORDING ||
                recordWebcam.status === CAMERA_STATUS.PREVIEW
            }
            onClick={recordWebcam.open}
            >
            Open camera
            </button>
            <button
            disabled={
                recordWebcam.status === CAMERA_STATUS.CLOSED ||
                recordWebcam.status === CAMERA_STATUS.PREVIEW
            }
            onClick={recordWebcam.close}
            >
            Close camera
            </button>
            <button
            disabled={
                recordWebcam.status === CAMERA_STATUS.CLOSED ||
                recordWebcam.status === CAMERA_STATUS.RECORDING ||
                recordWebcam.status === CAMERA_STATUS.PREVIEW
            }
            onClick={recordWebcam.start}
            >
            Start recording
            </button>
            <button
            disabled={recordWebcam.status !== CAMERA_STATUS.RECORDING}
            onClick={recordWebcam.stop}
            >
            Stop recording
            </button>
            <button
            disabled={recordWebcam.status !== CAMERA_STATUS.PREVIEW}
            onClick={recordWebcam.retake}
            >
            Retake
            </button>
            <button
            disabled={recordWebcam.status !== CAMERA_STATUS.PREVIEW}
            onClick={submitRecordings}
            >
            Submit Recordings
            </button>
            <button
            disabled={recordWebcam.status !== CAMERA_STATUS.PREVIEW}
            onClick={getRecordings}
            >
            Get Recordings
            </button>
        </div>

      <video
        ref={recordWebcam.webcamRef}
        style={{
          display: `${
            recordWebcam.status === CAMERA_STATUS.OPEN ||
            recordWebcam.status === CAMERA_STATUS.RECORDING
              ? "block"
              : "none"
          }`
        }}
        autoPlay
        muted
      />
      <video
        ref={recordWebcam.previewRef}
        style={{
          display: `${
            recordWebcam.status === CAMERA_STATUS.PREVIEW ? "block" : "none"
          }`
        }}
        controls
      />
    </div>
  );
}
