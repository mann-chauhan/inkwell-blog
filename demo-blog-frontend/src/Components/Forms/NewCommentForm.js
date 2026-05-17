import React, { useContext, useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import Banner from "../Banner";
import AuthContext from "../../store/auth-context";
import { submitNewComment } from "../../lib/api";
import { useTranslation } from "react-i18next";

const NewCommentForm = ({ postId, onContentChange }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const authCtx = useContext(AuthContext);
  const textAreaRef = useRef(null);
  const { t } = useTranslation();

  const onSubmit = (comment, formikHelpers) => {
    setTimeout(() => {
      submitNewComment({ id: postId, ...comment }, authCtx.token)
        .then(() => { formikHelpers.resetForm(); setIsSubmitted(true); })
        .catch(console.log)
        .finally(() => formikHelpers.setSubmitting(false));
    }, 2000);
  };

  useEffect(() => {
    setTimeout(() => {
      if (isSubmitted) { setIsSubmitted(false); onContentChange(); }
    }, 2000);
  }, [isSubmitted]);

  useEffect(() => {
    if (textAreaRef.current) textAreaRef.current.style.height = "100px";
  });

  return (
    <Formik
      initialValues={{ content: "" }}
      validationSchema={Yup.object({
        content: Yup.string()
          .min(5, t("validation:atLeast", { number: 5 }))
          .max(1000, t("validation:lessThan", { number: 1000 }))
          .required(t("validation:required")),
      })}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <>
          <div className="ink-new-comment-card">
            <form onSubmit={formik.handleSubmit}>
              <div className="ink-form-group" style={{ marginBottom: "0.75rem" }}>
                <label className="ink-form-label">{t("addNewComment")}</label>
                <textarea
                  ref={textAreaRef}
                  name="content"
                  className="ink-comment-textarea"
                  placeholder={t("addNewComment") + "…"}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.content}
                />
                {formik.touched.content && formik.errors.content && (
                  <div className="ink-form-error">{formik.errors.content}</div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="ink-btn" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? "Posting…" : t("addNewComment")}
                </button>
              </div>
            </form>
          </div>
          {isSubmitted && (
            <Banner className="text-success border-success mb-4"
              message={`${t("addedBy", { type: "comment" })} ${authCtx.userName}`} />
          )}
        </>
      )}
    </Formik>
  );
};
export default NewCommentForm;
