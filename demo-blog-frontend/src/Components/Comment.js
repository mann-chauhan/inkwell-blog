import React, { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../store/auth-context";
import { Formik } from "formik";
import * as Yup from "yup";
import Banner from "./Banner";
import { deleteComment, updateComment } from "../lib/api";
import { useTranslation } from "react-i18next";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const Comment = ({ comment, onContentChange }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [error, setError] = useState(null);
  const textAreaRef = useRef(null);
  const authCtx = useContext(AuthContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
    }
  });

  const canEdit = authCtx.isLoggedIn &&
    (authCtx.userName === comment.blogUser || authCtx.authorities === authCtx.ROLES.admin);

  const updateHandler = (values, formikHelpers) => {
    setTimeout(() => {
      updateComment({ id: comment.id, ...values }, authCtx.token)
        .then(() => setIsUpdated(true))
        .catch(e => setError(e))
        .finally(() => formikHelpers.setSubmitting(false));
    }, 2000);
  };

  const deleteHandler = () => {
    setIsDeleting(true);
    setTimeout(() => {
      deleteComment(comment.id, authCtx.token)
        .then(() => setIsDeleted(true))
        .catch(e => setError(e))
        .finally(() => setIsDeleting(false));
    }, 2000);
  };

  useEffect(() => {
    setTimeout(() => {
      if (isDeleted) { setIsDeleted(false); onContentChange(); }
      if (isUpdated) { setIsUpdated(false); onContentChange(); }
      if (error) setError(null);
    }, 2000);
  }, [isDeleted, isUpdated, error]);

  return (
    <Formik
      initialValues={{ content: comment.comment }}
      validationSchema={Yup.object({
        content: Yup.string()
          .min(5, t("validation:atLeast", { number: 5 }))
          .max(1000, t("validation:lessThan", { number: 1000 }))
          .required(t("validation:required")),
      })}
      onSubmit={updateHandler}
    >
      {(formik) => (
        <>
          <div className="ink-comment-card">
            <div className="ink-comment-header">
              <div className="ink-comment-user">
                <div className="ink-comment-avatar">{getInitials(comment.blogUser)}</div>
                <span className="ink-comment-username">{comment.blogUser}</span>
              </div>
              <span className="ink-comment-date">{t("commented")}: {comment.createdOn}</span>
            </div>
            <div className="ink-comment-body-wrap">
              <form onSubmit={formik.handleSubmit}>
                <textarea
                  ref={textAreaRef}
                  name="content"
                  className="ink-comment-textarea"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.content}
                  disabled={formik.isSubmitting || isDeleting || isDeleted || isUpdated}
                  readOnly={!canEdit}
                  style={{ overflow: "hidden" }}
                />
                {formik.touched.content && formik.errors.content && (
                  <div className="ink-form-error">{formik.errors.content}</div>
                )}
                {canEdit && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <button type="submit" className="ink-btn-ghost"
                      disabled={isDeleting || isDeleted || isUpdated}>
                      {formik.isSubmitting ? "Saving…" : t("update")}
                    </button>
                    <button type="button" className="ink-btn-danger"
                      onClick={deleteHandler}
                      disabled={formik.isSubmitting || isUpdated || isDeleted}>
                      {isDeleting ? "Deleting…" : t("delete")}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
          {isUpdated && <Banner className="text-success border-success mb-4" message={`${t("updatedBy", { type: "comment" })} ${authCtx.userName}`} />}
          {isDeleted && <Banner className="text-danger border-danger mb-4" message={`${t("deleteBy", { type: "comment" })} ${authCtx.userName}`} />}
          {error && <Banner className="text-danger border-danger mb-4" message={error.message} />}
        </>
      )}
    </Formik>
  );
};
export default Comment;
