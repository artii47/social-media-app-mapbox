import React, { useState, useRef } from "react";
import { Form, Button, Image, Divider, Message, Icon } from "semantic-ui-react";
import uploadPic from "../../utils/uploadPicToCloudinary";
import { submitNewPost } from "../../utils/postActions";
import CropImageModal from "./CropImageModal";
import GoogleMap from "./GoogleMap";

function CreatePost({ user, setPosts, isTravel }) {
  const [newPost, setNewPost] = useState({ text: "", location: "" });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const [error, setError] = useState(null);
  const [highlighted, setHighlighted] = useState(false);

  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [distance, setDistance] = useState(0);

  const handleChange = e => {
    const { name, value, files } = e.target;

    if (name === "media") {
      if (files && files.length > 0) {
        setMedia(files[0]);
        return setMediaPreview(URL.createObjectURL(files[0]));
      }
    }

    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  const addStyles = () => ({
    position: 'relative',
    textAlign: "center",
    height: "305px",
    width: "550px",
    border: "3px dotted",
    paddingTop: media === null && "60px",
    cursor: "pointer",
    borderColor: highlighted ? "green" : "#b0b0b0"
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    let picUrl;

    if (media !== null) {
      picUrl = await uploadPic(media);
      console.log(picUrl)
      if (!picUrl) {
        setLoading(false);
        return setError("Error Uploading Image");
      }
    }
    console.log('mapDatasdaASDASDDAS', mapData)
    await submitNewPost(
      user,
      newPost.text,
      newPost.location,
      picUrl,
      setPosts,
      setNewPost,
      setError,
      isTravel,
      mapData,
      distance
    );
    setShowMap(false);
    setMedia(null);
    mediaPreview && URL.revokeObjectURL(mediaPreview);
    setTimeout(() => setMediaPreview(null), 3000);
    setLoading(false);
  };

  const dragEvent = (e, valueToSet) => {
    e.preventDefault();
    setHighlighted(valueToSet);
  };

  return (
    <>
      {showModal && (
        <CropImageModal
          mediaPreview={mediaPreview}
          setMedia={setMedia}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      )}

      <Form error={error !== null} onSubmit={handleSubmit}>
        <Message
          error
          onDismiss={() => setError(null)}
          content={error}
          header="Oops!"
        />

        <Form.Group>
          <Image src={user.profilePicUrl} circular avatar inline />
          <Form.TextArea
            placeholder={isTravel? "Describe your trip!" :"Share your adventures!"}
            name="text"
            value={newPost.text}
            onChange={handleChange}
            rows={4}
            width={14}
          />
        </Form.Group>

        <Form.Group>
          <Form.Input
            value={newPost.location}
            name="location"
            onChange={handleChange}
            label="Add Location"
            icon="map marker alternate"
            placeholder="Want to add Location?"
          />

          <input
            ref={inputRef}
            onChange={handleChange}
            name="media"
            style={{ display: "none" }}
            type="file"
            accept="image/*"
          />
        </Form.Group>

        <div
          onClick={() => inputRef.current.click()}
          style={addStyles()}
          onDragOver={e => dragEvent(e, true)}
          onDragLeave={e => dragEvent(e, false)}
          onDrop={e => {
            dragEvent(e, true);

            const droppedFile = Array.from(e.dataTransfer.files);

            if (droppedFile?.length > 0) {
              setMedia(droppedFile[0]);
              setMediaPreview(URL.createObjectURL(droppedFile[0]));
            }
          }}
        >
          {media === null ? (
            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#b0b0b0', fontWeight: 'bold', fontSize: '18px'}}>
              Upload your photo
            </div>
          ) : (
            <Image
              style={{ height: "300px", width: "550px" }}
              src={mediaPreview}
              alt="PostImage"
              centered
              size="medium"
            />
          )}
        </div>

        {mediaPreview !== null && (
          <>
            <Divider hidden />

            <Button
              content="Crop Image"
              type="button"
              primary
              circular
              onClick={() => setShowModal(true)}
            />
          </>
        )}

        <Divider hidden />

        {isTravel && showMap && <GoogleMap setMapData={setMapData} setDistance={setDistance} distance={distance}/>}

        <Divider hidden />

        {isTravel && <Button
          circular
          onClick={() => {
            setShowMap(!showMap)
            if(showMap) {
              setDistance(0);
              setMapData(null);
            }
          }}
          content={<strong>{showMap ? 'Remove map' : 'Mark on map'}</strong>}
          style={{ backgroundColor: "#1DA1F2", color: "white" }}
          icon="world"
          type='button'
        />}

        <Button
          circular
          disabled={newPost.text === "" || loading}
          content={<strong>Post</strong>}
          style={{ backgroundColor: "#1DA1F2", color: "white" }}
          icon="send"
          loading={loading}
        />
      </Form>
      <Divider />
    </>
  );
}

export default CreatePost;
