import { useState } from "react";
import {
  Card,
  Icon,
  Image,
  Divider,
  Segment,
  Button,
  Popup,
  Header,
  Modal
} from "semantic-ui-react";
import PostComments from "./PostComments";
import CommentInputField from "./CommentInputField";
import calculateTime from "../../utils/calculateTime";
import Link from "next/link";
import { deletePost, joinTravel, likePost } from "../../utils/postActions";
import LikesList from "./LikesList";
import ImageModal from "./ImageModal";
import NoImageModal from "./NoImageModal";
import GoogleMap from './GoogleMap';
import catchErrors from "../../utils/catchErrors";
import { Axios } from "../../utils/postActions";

function CardPost({ post, user, setPosts, setShowToastr, socket, isTravel }) {
  const [likes, setLikes] = useState(post.likes);
  const [joinedUsers, setJoinedUsers] = useState(post.joinedUsers.map(u => {return {
    user: u.user._id
  }}))
  console.log(joinedUsers)
  console.log('post', post)
  const isLiked =
    likes.length > 0 && likes.filter(like => like.user === user._id).length > 0;
  const isJoined = joinedUsers?.find(q => q.user === user._id);
  const [comments, setComments] = useState(post.comments);
  const [showModal, setShowModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [tripPosts, setTripPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const addPropsToModal = {
    post,
    user,
    setLikes,
    likes,
    isLiked,
    comments,
    setComments
  };
  console.log('tripPosts', tripPosts)
  const getTripPostsList = async () => {
    setLoading(true);
    try {
      const res = await Axios.get(`/${post._id}`);
      setTripPosts(res.data);
    } catch (error) {
      alert(catchErrors(error));
    }
    setLoading(false);
  };

  return (
    <>
      {showModal && (
        <Modal
          open={showModal}
          closeIcon
          closeOnDimmerClick
          onClose={() => setShowModal(false)}
        >
          <Modal.Content>
            {post.picUrl ? (
              <ImageModal {...addPropsToModal} />
            ) : (
              <NoImageModal {...addPropsToModal} />
            )}
          </Modal.Content>
        </Modal>
      )}

      <Segment basic>
        <Card color="teal" fluid>
          {post.picUrl && (
            <Image
              src={post.picUrl}
              style={{ cursor: "pointer" }}
              floated="left"
              wrapped
              ui={false}
              alt="PostImage"
              onClick={() => setShowModal(true)}
            />
          )}
          <Card.Content>
            <Image floated="left" src={post.user.profilePicUrl} avatar circular />

            {(user.role === "root" || post.user._id === user._id) && (
              <>
                <Popup
                  on="click"
                  position="top right"
                  trigger={
                    <Image
                      src="/deleteIcon.svg"
                      style={{ cursor: "pointer" }}
                      size="mini"
                      floated="right"
                    />
                  }
                >
                  <Header as="h4" content="Are you sure?" />
                  <p>This action is irreversible!</p>

                  <Button
                    color="red"
                    icon="trash"
                    content="Delete"
                    onClick={() => deletePost(post._id, setPosts, setShowToastr)}
                  />
                </Popup>
              </>
            )}

            <Card.Header>
              <Link href={`/${post.user.username}`}>
                <a>{post.user.name}</a>
              </Link>
            </Card.Header>

            <Card.Meta>{calculateTime(post.createdAt)}</Card.Meta>

            {post.location && <Card.Meta content={post.location} />}

            <Card.Description
              style={{
                fontSize: "17px",
                letterSpacing: "0.1px",
                wordSpacing: "0.35px"
              }}
            >
              {post.text}
            </Card.Description>
            {post.mapData && showMap && <div style={{marginTop: '20px'}}> <GoogleMap mapData={post.mapData} distance={post.distance}/> </div>}
            <div style={{display: 'flex'}}>
            {isTravel && post.user._id !== user._id &&<div style={{marginTop: '20px'}}> <Button
                    color="orange"
                    content={isJoined ? 'Unjoin' : "Join"}
                    basic
                circular
                    onClick={() => {
                        joinTravel(post._id, user._id, setJoinedUsers, setPosts, isJoined)
                    }}
                  /></div>}
              {post.mapData && <div style={{marginTop: '20px', marginRight: '5px', marginLeft: '5px'}}><Button
                content={!showMap ? "Show map" : "Hide map"}
                color="teal"
                basic
                circular
                onClick={() => {setShowMap(!showMap)}}
                /></div>}
                {isTravel && <div style={{marginTop: '20px'}}>
                <Popup
                  on="click"
                  position="top right"
                  onOpen={getTripPostsList}
                  trigger={
                    <Button
                content={`Participants (${joinedUsers.length})`}
                color="teal"
                basic
                circular
                />
                  }
                >
                  {!!tripPosts?.joinedUsers?.length ? tripPosts.joinedUsers.map(t => {
                    return <div style={{display: 'block'}}> <Link href={`/${t.user.name}`}>{t.user.name}</Link> </div>
                  }) : 'No participants'}
                </Popup>
                </div>}
            </div>
              
          </Card.Content>
          <Card.Content extra>
            <Icon
              name={isLiked ? "heart" : "heart outline"}
              color="red"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (socket.current) {
                  socket.current.emit("likePost", {
                    postId: post._id,
                    userId: user._id,
                    like: isLiked ? false : true
                  });

                  socket.current.on("postLiked", () => {
                    if (isLiked) {
                      setLikes(prev => prev.filter(like => like.user !== user._id));
                    }
                    //
                    else {
                      setLikes(prev => [...prev, { user: user._id }]);
                    }
                  });
                } else {
                  likePost(post._id, user._id, setLikes, isLiked ? false : true);
                }
              }}
            />

            <LikesList
              postId={post._id}
              trigger={
                likes.length > 0 && (
                  <span className="spanLikesList">
                    {`${likes.length} ${likes.length === 1 ? "like" : "likes"}`}
                  </span>
                )
              }
            />

            <Icon name="comment outline" style={{ marginLeft: "7px" }} color="blue" />

            {comments.length > 0 &&
              comments.map(
                (comment, i) =>
                  i < 3 && (
                    <PostComments
                      key={comment._id}
                      comment={comment}
                      postId={post._id}
                      user={user}
                      setComments={setComments}
                    />
                  )
              )}

            {comments.length > 3 && (
              <Button
                content="View More"
                color="teal"
                basic
                circular
                onClick={() => setShowModal(true)}
              />
            )}

            <Divider hidden />

            <CommentInputField
              user={user}
              postId={post._id}
              setComments={setComments}
            />
          </Card.Content>
        </Card>
      </Segment>
      <Divider hidden />
    </>
  );
}

export default CardPost;
