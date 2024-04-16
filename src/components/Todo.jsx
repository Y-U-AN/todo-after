import { useEffect, useRef, useState, useCallback } from "react"; // Add useRef & useCallback
import Popup from "reactjs-popup"; // For our popups
import "reactjs-popup/dist/index.css"; // For the popups to look nicer.
import Webcam from "react-webcam"; // For using react-webcam
import { addPhoto, GetPhotoSrc } from "../db.jsx"; // We will need this for futher steps
import MyMap from '../MyMap.jsx';




function usePrevious(value) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function Todo(props) {
  const [isEditing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const editFieldRef = useRef(null);
  const editButtonRef = useRef(null);

  const wasEditing = usePrevious(isEditing);

  function handleChange(event) {
    setNewName(event.target.value);
  }

  // NOTE: As written, this function has a bug: it doesn't prevent the user
  // from submitting an empty form. This is left as an exercise for developers
  // working through MDN's React tutorial.
  function handleSubmit(event) {
    event.preventDefault();
    props.editTask(props.id, newName);
    setNewName("");
    setEditing(false);
  }

  const editingTemplate = (
    <form className="stack-small" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="todo-label" htmlFor={props.id}>
          New name for {props.name}
        </label>
        <input
          id={props.id}
          className="todo-text"
          type="text"
          value={newName}
          onChange={handleChange}
          ref={editFieldRef}
        />
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn todo-cancel"
          onClick={() => setEditing(false)}
        >
          Cancel
          <span className="visually-hidden">renaming {props.name}</span>
        </button>
        <button type="submit" className="btn btn__primary todo-edit">
          Save
          <span className="visually-hidden">new name for {props.name}</span>
        </button>
      </div>
    </form>
  );

  const viewTemplate = (
    <div className="stack-small">
      <div className="c-cb">
        <input
          id={props.id}
          type="checkbox"
          defaultChecked={props.completed}
          onChange={() => props.toggleTaskCompleted(props.id)}
        />
        <label className="todo-label" htmlFor={props.id}>
          {props.name}
          <Popup
            trigger={
              <button>
                <a href={props.location?.mapURL}>(map)</a>
              </button>
            }
            modal
            >
            {(close) => (
              <div>
                <ViewLocation id={props.id} alt={props.name} />
              </div>
            )}
          </Popup>
          &nbsp; | &nbsp;
          <Popup
            trigger={
              <button>
                <a href={props.location?.smsURL}>(sms)</a>
              </button>
            }
            modal
            >
              {(close) => (
              <div className="center-content">
                
              </div>
            )}
          </Popup>
          &nbsp; | &nbsp;
          {/* 显示坐标的部分 */}
          {props.location && (
            <span>
              (Lat: {props.location.latitude}, Long: {props.location.longitude})
            </span>
          )}
        </label>
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditing(true);
          }}
          ref={editButtonRef}
        >
          Edit <span className="visually-hidden">{props.name}</span>
        </button>
  
        <Popup
          trigger={
            <button type="button" className="btn">
              {" "}
              Take Photo{" "}
            </button>
          }
          modal
        >
          <div>
            <WebcamCapture id={props.id} photoedTask={props.photoedTask} />
          </div>
        </Popup>
        
        <button
          type="button"
          className="btn btn__danger"
          onClick={() => props.deleteTask(props.id)}
        >
          Delete <span className="visually-hidden">{props.name}</span>
        </button>
        <Popup
          trigger={
            <button type="button" className="btn">
              {" "}
              View Photo{" "}
            </button>
          }
          modal
        >
          <div>
            <ViewPhoto id={props.id} alt={props.name} />
          </div>
        </Popup>
      </div>
    </div>
  );
  

  useEffect(() => {
    if (!wasEditing && isEditing) {
      editFieldRef.current.focus();
    } else if (wasEditing && !isEditing) {
      editButtonRef.current.focus();
    }
  }, [wasEditing, isEditing]);

  return <li className="todo">{isEditing ? editingTemplate : viewTemplate}</li>;
}

const WebcamCapture = (props) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [imgId, setImgId] = useState(null);
  const [photoSave, setPhotoSave] = useState(false);

  useEffect(() => {
    if (photoSave) {
      console.log("useEffect detected photoSave");
      if (typeof props.photoedTask === 'function') {
        props.photoedTask(imgId);
      } else {
        console.error('Expected photoedTask to be a function, but got', typeof props.photoedTask);
      }
      setPhotoSave(false);
    }
  }, [photoSave, imgId, props.photoedTask]);
  
  

  console.log("WebCamCapture", props.id);

    const capture = useCallback( (id) => {
      const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        console.log("capture", imageSrc.length, id);
      },
      [webcamRef, setImgSrc]
    );

    const savePhoto = (id, imgSrc) => {
      console.log("savePhoto", imgSrc.length, id);
      addPhoto(id, imgSrc);
      setImgId(id);
      setPhotoSave(true);
    };

    const cancelPhoto = () => {
      setImgSrc(null);
    };
    
    const videoConstraints = {
      width: 100,
      height: 100,
      facingMode: "environment", 
    };

    

    return (
      <>
        {!imgSrc &&  (
          
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
          />
        )}
      {imgSrc && <img src={imgSrc} />} // After image capture show the static picture captured
      <div className="btn-group">
        {!imgSrc && (
          <button
          type="button"
          className="btn"
          onClick={() => capture(props.id)}>
          Capture photo
          </button>
        )}
        {imgSrc && (
          <button
            type="button"
            className="btn"
            onClick={() => savePhoto(props.id, imgSrc)}>
            Save Photo
          </button>
        )}
          <button
            type="button"
            className="btn todo-cancel"
            onClick={cancelPhoto}>Cancel
          </button>

        </div>
      </>);
    };
        
    const ViewPhoto = (props) => {
      const photoSrc = GetPhotoSrc(props.id);
      const imageStyle = {
        width: 100,
        height: 100,
      };
    
      return (
        <div className="center-content">
          {photoSrc ? (
            <img src={photoSrc} alt={`Photo of ${props.name}`} />
          ) : (
            <p>This side is empty</p>
          )}
        </div>

      );
    };
    
    const ViewLocation = () => {
      return (
        <div>
          <MyMap />
        </div>
      );
    };
    

export default Todo;
