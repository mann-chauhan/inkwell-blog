import React, { useContext } from "react";
import MainPage from "./MainPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import NewPostPage from "./NewPostPage";
import PostPage from "./PostPage";
import UserProfilePage from "./UserProfilePage";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthContext from "../store/auth-context";

const Pages = (props) => {
  const authCtx = useContext(AuthContext);
  return (
    <Routes>
      {!authCtx.isLoggedIn && <Route path="/login"    element={<LoginPage    {...props} />} />}
      {!authCtx.isLoggedIn && <Route path="/register" element={<RegisterPage {...props} />} />}
      <Route path="/new-post"     element={authCtx.isLoggedIn ? <NewPostPage {...props} /> : <Navigate to="/" />} />
      <Route path="/post/:id"     element={<PostPage        {...props} />} />
      <Route path="/user/:username" element={<UserProfilePage {...props} />} />
      <Route path="/"             element={<MainPage        {...props} />} />
      <Route path="*"             element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Pages;
