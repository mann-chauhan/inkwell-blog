import React from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { useTranslation } from "react-i18next";

const RegistrationForm = ({ onSubmit, isSubmitted }) => {
  const { t } = useTranslation();
  return (
    <Formik
      initialValues={{ userName: "", email: "", password: "" }}
      validationSchema={Yup.object({
        userName: Yup.string().min(3, t("validation:atLeast", { number: 3 })).max(15, t("validation:lessThan", { number: 15 })).required(t("validation:required")),
        email: Yup.string().email(t("validation:invalidEmail")).required(t("validation:required")),
        password: Yup.string().min(5, t("validation:atLeast", { number: 5 })).max(15, t("validation:lessThan", { number: 15 })).required(t("validation:required")),
      })}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <div className="ink-form-card">
          <div className="ink-form-card-header">
            <h2 className="ink-form-card-title">{t("registrationForm")}</h2>
          </div>
          <form className="ink-form-inner" onSubmit={formik.handleSubmit}>
            <div className="ink-form-group">
              <label className="ink-form-label">{t("userName")}</label>
              <input className={`ink-form-input${formik.touched.userName && formik.errors.userName ? " is-invalid" : ""}`}
                type="text" name="userName" placeholder={t("enterUserName")}
                onChange={formik.handleChange} onBlur={formik.handleBlur}
                value={formik.values.userName} disabled={isSubmitted} />
              {formik.touched.userName && formik.errors.userName && <div className="ink-form-error">{formik.errors.userName}</div>}
              {formik.errors.register && <div className="ink-form-error">{formik.errors.register}</div>}
            </div>
            <div className="ink-form-group">
              <label className="ink-form-label">{t("email")}</label>
              <input className={`ink-form-input${formik.touched.email && formik.errors.email ? " is-invalid" : ""}`}
                type="email" name="email" placeholder={t("enterEmail")}
                onChange={formik.handleChange} onBlur={formik.handleBlur}
                value={formik.values.email} disabled={isSubmitted} />
              {formik.touched.email && formik.errors.email && <div className="ink-form-error">{formik.errors.email}</div>}
            </div>
            <div className="ink-form-group">
              <label className="ink-form-label">{t("password")}</label>
              <input className={`ink-form-input${formik.touched.password && formik.errors.password ? " is-invalid" : ""}`}
                type="password" name="password" placeholder={t("password")}
                onChange={formik.handleChange} onBlur={formik.handleBlur}
                value={formik.values.password} disabled={isSubmitted} />
              {formik.touched.password && formik.errors.password && <div className="ink-form-error">{formik.errors.password}</div>}
            </div>
            <button type="submit" className="ink-btn" disabled={formik.isSubmitting || isSubmitted}>
              {formik.isSubmitting ? "Creating account…" : t("register")}
            </button>
          </form>
        </div>
      )}
    </Formik>
  );
};
export default RegistrationForm;
