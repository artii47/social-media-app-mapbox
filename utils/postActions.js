import axios from "axios";
import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";
import cookie from "js-cookie";

export const Axios = axios.create({
  baseURL: `${baseUrl}/api/posts`,
  headers: { Authorization: cookie.get("token") }
});

export const submitNewPost = async (
  user,
  text,
  location,
  picUrl,
  setPosts,
  setNewPost,
  setError,
  isTravel,
  mapData,
  distance
) => {
  try {
    const res = await Axios.post("/", { text, location, picUrl, isTravel, mapData, distance });

    const newPost = {
      ...res.data,
      user,
      likes: [],
      comments: [],
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPost({ text: "", location: "" });
  } catch (error) {
    const errorMsg = catchErrors(error);
    setError(errorMsg);
  }
};

export const deletePost = async (postId, setPosts, setShowToastr) => {
  try {
    await Axios.delete(`/${postId}`);
    setPosts(prev => prev.filter(post => post._id !== postId));
    setShowToastr(true);
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const likePost = async (postId, userId, setLikes, like = true) => {
  try {
    if (like) {
      await Axios.post(`/like/${postId}`);
      setLikes(prev => [...prev, { user: userId }]);
    }
    //
    else if (!like) {
      await Axios.put(`/unlike/${postId}`);
      setLikes(prev => prev.filter(like => like.user !== userId));
    }
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const joinTravel = async (postId, userId, setJoinedUsers, setPosts, isJoined) => {
  try {
    if (!isJoined) {
      await Axios.post(`/join/${postId}`);
      setJoinedUsers(prev => [...prev, { user: userId }]);
      setPosts(prev => prev)
    }
    //
    else if (isJoined) {
      await Axios.put(`/unjoin/${postId}`);
      setJoinedUsers(prev => prev.filter(like => like.user !== userId));
      setPosts(prev => prev)
    }
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const postComment = async (postId, user, text, setComments, setText) => {
  try {
    const res = await Axios.post(`/comment/${postId}`, { text });

    const newComment = {
      _id: res.data,
      user,
      text,
      date: Date.now()
    };

    setComments(prev => [newComment, ...prev]);
    setText("");
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const deleteComment = async (postId, commentId, setComments) => {
  try {
    await Axios.delete(`/${postId}/${commentId}`);
    setComments(prev => prev.filter(comment => comment._id !== commentId));
  } catch (error) {
    alert(catchErrors(error));
  }
};
