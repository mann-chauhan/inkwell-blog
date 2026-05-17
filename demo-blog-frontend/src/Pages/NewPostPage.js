import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitNewPost } from "../lib/api";
import NewPostForm from "../Components/Forms/NewPostForm";
import AuthContext from "../store/auth-context";
import Banner from "../Components/Banner";
import { useTranslation } from "react-i18next";

const NewPostPage = () => {
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onSubmit = async (newPost, formikHelpers) => {
    setErrorMessage("");
    setStatusMessage("");

    try {
      const post = await submitNewPost(newPost, authContext.token);
      setStatusMessage(`${t("addedBy", { type: "post" })} ${authContext.userName}`);
      navigate(`/post/${post.id}`);
    } catch (error) {
      setErrorMessage(error.message || t("unknownError"));
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <div className="ink-page page-fade-in">
      <div className="ink-form-wrap">
        <NewPostForm isSubmitted={!!statusMessage} onSubmit={onSubmit} />
        {statusMessage && <Banner className="text-success border-success mt-4" message={statusMessage} />}
        {errorMessage && <Banner className="text-danger border-danger mt-4" message={errorMessage} />}
      </div>
    </div>
  );
};
export default NewPostPage;
