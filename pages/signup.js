import { useState, useEffect, useRef } from "react";
import { Form, Button, Message, Segment, Divider } from "semantic-ui-react";
import CommonInputs from "../components/Common/CommonInputs";
import ImageDropDiv from "../components/Common/ImageDropDiv";
import { HeaderMessage, FooterMessage } from "../components/Common/WelcomeMessage";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { registerUser } from "../utils/authUser";
import uploadPic from "../utils/uploadPicToCloudinary";
let controller = null;

function Signup() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    facebook: "",
    youtube: "",
    twitter: "",
    instagram: ""
  });

  const { name, email, password, bio } = user;

  const handleChange = e => {
    const { name, value, files } = e.target;

    if (name === "media") {
      if (files && files.length > 0) {
        setMedia(files[0]);
        return setMediaPreview(URL.createObjectURL(files[0]));
      }
    }

    setUser(prev => ({ ...prev, [name]: value }));
  };

  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const usernameInputDiv = useRef();
  const requiredFieldDiv = useRef();
  const usernameInput = useRef();
  const leftIcon = useRef();

  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [highlighted, setHighlighted] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    const isUser = Object.values({ name, email, password }).every(item =>
      Boolean(item)
    );
    isUser ? setSubmitDisabled(false) : setSubmitDisabled(true);
  }, [user]);

  const checkUsername = async (value = "") => {
    if (value.length === 0 || value.trim().length === 0) {
      if (!requiredFieldDiv.current.classList.contains("error")) {
        requiredFieldDiv.current.classList.add("error");
      }

      leftIcon.current.className = "close icon";
      return;
    }

    usernameInput.current.value = value;

    usernameInputDiv.current.classList.add("loading");

    try {
      if (controller) controller.abort();

      controller = new AbortController();

      const res = await axios.get(`${baseUrl}/api/signup/${value}`, {
        signal: controller.signal
      });

      if (res.data === "Available") {
        if (requiredFieldDiv.current.classList.contains("error")) {
          requiredFieldDiv.current.classList.remove("error");
        }

        leftIcon.current.className = "check icon";
        setUser(prev => ({ ...prev, username: value }));
      }
    } catch (error) {
      setErrorMsg("Username Not Available");

      if (!requiredFieldDiv.current.classList.contains("error")) {
        requiredFieldDiv.current.classList.add("error");
      }

      leftIcon.current.className = "close icon";
    }

    usernameInputDiv.current.classList.remove("loading");
    controller = null;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (requiredFieldDiv.current.classList.contains("error")) {
      return setErrorMsg("Username not available");
    }

    setFormLoading(true);

    let profilePicUrl;
    if (media !== null) {
      profilePicUrl = await uploadPic(media);
    }

    if (media !== null && !profilePicUrl) {
      setFormLoading(false);
      return setErrorMsg("Error Uploading Image");
    }

    await registerUser(user, profilePicUrl, setErrorMsg, setFormLoading);
  };

  return (
    <>
      <HeaderMessage />
      <Form loading={formLoading} error={errorMsg !== null} onSubmit={handleSubmit}>
        <Message
          error
          header="Oops!"
          content={errorMsg}
          onDismiss={() => setErrorMsg(null)}
        />

        <Segment>
          <ImageDropDiv
            mediaPreview={mediaPreview}
            setMediaPreview={setMediaPreview}
            setMedia={setMedia}
            inputRef={inputRef}
            highlighted={highlighted}
            setHighlighted={setHighlighted}
            handleChange={handleChange}
          />
          <Form.Input
            required
            label="Name"
            placeholder="Name"
            name="name"
            value={name}
            onChange={handleChange}
            fluid
            icon="user"
            iconPosition="left"
          />

          <Form.Input
            required
            label="Email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={handleChange}
            fluid
            icon="envelope"
            iconPosition="left"
            type="email"
          />

          <Form.Input
            label="Password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={handleChange}
            fluid
            icon={{
              name: "eye",
              circular: true,
              link: true,
              onClick: () => setShowPassword(!showPassword)
            }}
            iconPosition="left"
            type={showPassword ? "text" : "password"}
            required
          />

          <div ref={requiredFieldDiv} className="required field">
            <label htmlFor="usernameInput">Username</label>
            <div ref={usernameInputDiv} className="ui fluid left icon input">
              <input
                ref={usernameInput}
                placeholder="Username"
                required
                onChange={e => checkUsername(e.target.value)}
              />
              <i aria-hidden="true" ref={leftIcon} className="close icon" />
            </div>
          </div>

          <CommonInputs
            user={user}
            showSocialLinks={showSocialLinks}
            setShowSocialLinks={setShowSocialLinks}
            handleChange={handleChange}
          />

          <Divider hidden />
          <Button
            icon="signup"
            content="Signup"
            type="submit"
            color="orange"
            disabled={submitDisabled}
          />
        </Segment>
      </Form>

      <FooterMessage />
    </>
  );
}

export default Signup;
