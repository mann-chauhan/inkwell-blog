import React, { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../store/auth-context";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const PostUpdateForm = ({ post, onSubmit, onPostDelete, isDeletingPost, isPostDeleted }) => {
  const textAreaRef = useRef(null);
  const authCtx = useContext(AuthContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
    }
  });

  const canEdit = authCtx.isLoggedIn &&
    (authCtx.userName === post.blogUser || authCtx.authorities === authCtx.ROLES.admin);

  return (
    <Formik
      initialValues={{ content: post.content }}
      validationSchema={Yup.object({
        content: Yup.string()
          .min(250, t("validation:atLeast", { number: 250 }))
          .max(5000, t("validation:lessThan", { number: 5000 }))
          .required(t("validation:required")),
      })}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <div className="ink-post-shell">
          {/* clickable author chip → profile page */}
          <Link
            to={`/user/${encodeURIComponent(post.blogUser)}`}
            className="ink-author-chip"
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            <div className="ink-author-avatar">{getInitials(post.blogUser)}</div>
            <span className="ink-author-name">{post.blogUser}</span>
          </Link>

          <h1 className="ink-post-heading">{post.title}</h1>

          <div className="ink-post-body-card">
            <form onSubmit={formik.handleSubmit}>
              {canEdit ? (
                <textarea
                  ref={textAreaRef}
                  name="content"
                  className="ink-post-textarea"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.content}
                  disabled={formik.isSubmitting || isDeletingPost || isPostDeleted}
                  style={{ overflow: "hidden" }}
                />
              ) : (
                <p className="ink-post-content">{post.content}</p>
              )}
              {formik.touched.content && formik.errors.content && (
                <div className="ink-form-error">{formik.errors.content}</div>
              )}

              {canEdit && (
                <div className="ink-post-actions">
                  <button type="submit" className="ink-btn-ghost"
                    disabled={formik.isSubmitting || isDeletingPost || isPostDeleted}>
                    {formik.isSubmitting ? "Saving…" : t("update")}
                  </button>
                  <button type="button" className="ink-btn-danger"
                    onClick={onPostDelete}
                    disabled={formik.isSubmitting || isPostDeleted}>
                    {isDeletingPost ? "Deleting…" : t("delete")}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="ink-date-row">
            <span className="ink-date-pill">{t("posted")}: {post.createdOn}</span>
            <span className="ink-date-pill">{t("edited")}: {post.updatedOn}</span>
          </div>
        </div>
      )}
    </Formik>
  );
};

export default PostUpdateForm;
