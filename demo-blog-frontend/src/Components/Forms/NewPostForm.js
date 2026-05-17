import React, { useContext } from "react";
import AuthContext from "../../store/auth-context";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

const NewPostForm = ({ onSubmit, isSubmitted }) => {
  const authCtx = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{ title: "", content: "", published: true }}
      validationSchema={Yup.object({
        title: Yup.string().min(3, t("validation:atLeast", { number: 3 })).max(200, t("validation:lessThan", { number: 200 })).required(t("validation:required")),
        content: Yup.string().min(250, t("validation:atLeast", { number: 250 })).max(50000, t("validation:lessThan", { number: 50000 })).required(t("validation:required")),
      })}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <div className="ink-form-card" style={{ maxWidth: 680 }}>
          <div className="ink-form-card-header">
            <h2 className="ink-form-card-title">{t("newPostBy")} {authCtx.userName}</h2>
          </div>
          <form className="ink-form-inner" onSubmit={formik.handleSubmit}>
            <div className="ink-form-group">
              <label className="ink-form-label">{t("title")}</label>
              <input className={`ink-form-input${formik.touched.title && formik.errors.title ? " is-invalid" : ""}`}
                type="text" name="title" placeholder={t("enterNewPostHere")}
                onChange={formik.handleChange} onBlur={formik.handleBlur}
                value={formik.values.title} disabled={isSubmitted} />
              {formik.touched.title && formik.errors.title && <div className="ink-form-error">{formik.errors.title}</div>}
            </div>
            <div className="ink-form-group">
              <label className="ink-form-label">{t("content")}</label>
              <textarea className={`ink-form-input ink-post-textarea${formik.touched.content && formik.errors.content ? " is-invalid" : ""}`}
                name="content"
                onChange={formik.handleChange} onBlur={formik.handleBlur}
                value={formik.values.content} disabled={isSubmitted}
                rows={12}
              />
              {formik.touched.content && formik.errors.content && <div className="ink-form-error">{formik.errors.content}</div>}
            </div>

            <div className="ink-publish-selector">
              <button
                type="button"
                className={`ink-publish-opt${formik.values.published ? " active" : ""}`}
                onClick={() => formik.setFieldValue("published", true)}
                disabled={isSubmitted}
              >
                <span className="ink-publish-dot published" />
                Publish now
              </button>
              <button
                type="button"
                className={`ink-publish-opt${!formik.values.published ? " active" : ""}`}
                onClick={() => formik.setFieldValue("published", false)}
                disabled={isSubmitted}
              >
                <span className="ink-publish-dot draft" />
                Save as draft
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="ink-btn" disabled={formik.isSubmitting || isSubmitted}>
                {formik.isSubmitting
                  ? "Saving…"
                  : formik.values.published
                    ? t("addNewPost")
                    : "Save draft"
                }
              </button>
            </div>
          </form>
        </div>
      )}
    </Formik>
  );
};
export default NewPostForm;
