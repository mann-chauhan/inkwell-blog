import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import NewCommentForm from "../Components/Forms/NewCommentForm";
import CommentsList from "../Components/CommentsList";
import PostUpdateForm from "../Components/Forms/PostUpdateForm";
import Loading from "../Components/Loading";
import {
  deletePost,
  getPostById,
  updatePost,
  incrementPostViews,
  likePost,
  togglePublishPost,
} from "../lib/api";
import Banner from "../Components/Banner";
import AuthContext from "../store/auth-context";
import { useTranslation } from "react-i18next";
import ScrollToTop from "../Components/ScrollToTop";

function readTime(content = "") {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const PostPage = () => {
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const { id } = useParams();
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const likedPost = localStorage.getItem(`inkwell-liked-${id}`);
    if (likedPost) setLiked(true);
  }, [id]);

  const fetchPostById = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const p = await getPostById(id);
      setPost(p);
      setComments(Array.isArray(p.comments) ? p.comments : []);
    } catch (err) {
      setError(err.message || "Unable to load post.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostById();
    incrementPostViews(id).catch(() => {
      // analytics failure should not block page render
    });
  }, [id]);

  const onPostUpdate = async (updatedContent, formikHelpers) => {
    setStatusMessage("");
    try {
      await updatePost({ id: post.id, content: updatedContent.content }, authCtx.token);
      setStatusMessage(t("updatedBy", { type: "post" }));
      await fetchPostById();
    } catch (err) {
      setError(err.message || t("updateFailed"));
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  const onPostDelete = async () => {
    setIsDeletingPost(true);
    try {
      await deletePost(post.id, authCtx.token);
      navigate("/");
    } catch (err) {
      setError(err.message || t("deleteFailed"));
    } finally {
      setIsDeletingPost(false);
    }
  };

  const onLike = async () => {
    if (liked) return;
    try {
      const updated = await likePost(post.id);
      setPost((current) => ({ ...current, likeCount: updated.likeCount }));
      setLiked(true);
      localStorage.setItem(`inkwell-liked-${id}`, "1");
    } catch (err) {
      setError(err.message || t("likeFailed"));
    }
  };

  const onTogglePublish = async () => {
    setIsTogglingPublish(true);
    try {
      const updated = await togglePublishPost(post.id, !post.published, authCtx.token);
      setPost((current) => ({ ...current, published: updated.published }));
    } catch (err) {
      setError(err.message || t("publishFailed"));
    } finally {
      setIsTogglingPublish(false);
    }
  };

  const canEdit = authCtx.isLoggedIn &&
    (authCtx.userName === post.blogUser || authCtx.hasRole(authCtx.ROLES.admin));

  return (
    <div className="ink-post-page page-fade-in">
      <div className="ink-post-shell">
        <Link to="/" className="ink-back-btn">← Back</Link>

        {isLoading && <Loading />}
        {error && <Banner className="text-danger border-danger" message={error} />}
        {statusMessage && <Banner className="text-success border-success mt-4" message={statusMessage} />}

        {!isLoading && !error && (
          <>
            <div className="ink-date-row">
              <span className="ink-date-pill">{readTime(post.content)} min read</span>
              <span className="ink-date-pill">{comments.length} comment{comments.length !== 1 ? "s" : ""}</span>
              <span className="ink-date-pill ink-views-pill"><EyeIcon /> {post.views || 0} view{(post.views || 0) !== 1 ? "s" : ""}</span>
              {!post.published && <span className="ink-date-pill">Draft</span>}
            </div>

            <PostUpdateForm
              onSubmit={onPostUpdate}
              onPostDelete={onPostDelete}
              isDeletingPost={isDeletingPost}
              post={post}
            />

            <div className="ink-post-reactions">
              <button
                className={`ink-like-btn${liked ? " liked" : ""}`}
                onClick={onLike}
                disabled={liked}
                title={liked ? t("alreadyLiked") : t("likeThisPost")}
              >
                <HeartIcon filled={liked} />
                <span>{post.likeCount || 0}</span>
              </button>

              {canEdit && (
                <button
                  className={`ink-publish-toggle-btn${post.published ? " published" : ""}`}
                  onClick={onTogglePublish}
                  disabled={isTogglingPublish}
                >
                  {isTogglingPublish
                    ? t("saving")
                    : post.published
                      ? t("publishedAction")
                      : t("draftAction")
                  }
                </button>
              )}
            </div>

            <hr className="ink-divider" />

            {(authCtx.isLoggedIn || comments.length > 0) && (
              <div className="ink-comments-header">
                <h2 className="ink-comments-title">{t("comments")}</h2>
                <span className="ink-comments-badge">{comments.length}</span>
              </div>
            )}

            {authCtx.isLoggedIn && <NewCommentForm onContentChange={fetchPostById} postId={post.id} />}
            <CommentsList onContentChange={fetchPostById} comments={comments} />
          </>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
};

export default PostPage;
