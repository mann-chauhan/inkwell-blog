import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";
import LoginForm from "../Components/Forms/LoginForm";
import AuthContext from "../store/auth-context";
import Banner from "../Components/Banner";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onSubmit = async (loginRequest, formikHelpers) => {
    setErrorMessage("");
    setStatusMessage("");

    try {
      const res = await login(loginRequest);
      authCtx.login(res);
      setStatusMessage(`${t("signedInAs")} ${res.userName}`);
      navigate("/");
    } catch (error) {
      const message = error.message || "Invalid credentials";
      if (message.toLowerCase().includes("password")) {
        formikHelpers.setFieldError("invalidPassword", t("validation:invalidPassword"));
      } else {
        formikHelpers.setFieldError("invalidUsername", t("validation:invalidUsername"));
      }
      setErrorMessage(message);
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <div className="ink-page page-fade-in">
      <div className="ink-form-wrap">
        <div style={{ width: "100%", maxWidth: 480 }}>
          <LoginForm isSubmitted={!!statusMessage} onSubmit={onSubmit} />
          {statusMessage && <Banner className="text-success border-success mt-4" message={statusMessage} />}
          {errorMessage && <Banner className="text-danger border-danger mt-4" message={errorMessage} />}
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
