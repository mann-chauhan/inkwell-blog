import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../lib/api";
import RegistrationForm from "../Components/Forms/RegistrationForm";
import Banner from "../Components/Banner";
import { useTranslation } from "react-i18next";

const RegisterPage = () => {
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onSubmit = async (values, formikHelpers) => {
    setErrorMessage("");
    setStatusMessage("");

    try {
      const data = await register(values);
      formikHelpers.resetForm();
      const message = t("newUserCreated", { newUser: data.userName });
      setStatusMessage(message);
      navigate("/login");
    } catch (error) {
      const message = error.message || t("userAlreadyExists");
      formikHelpers.setFieldError("register", t("userAlreadyExists", { userName: message }));
      setErrorMessage(message);
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <div className="ink-page page-fade-in">
      <div className="ink-form-wrap">
        <div style={{ width: "100%", maxWidth: 480 }}>
          <RegistrationForm isSubmitted={!!statusMessage} onSubmit={onSubmit} />
          {statusMessage && <Banner className="text-success border-success mt-4" message={statusMessage} />}
          {errorMessage && <Banner className="text-danger border-danger mt-4" message={errorMessage} />}
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
