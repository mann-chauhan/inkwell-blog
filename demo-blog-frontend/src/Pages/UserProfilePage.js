import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAllPosts, getMyDrafts } from "../lib/api";
import Loading from "../Components/Loading";
import AuthContext from "../store/auth-context";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function readTime(content = "") {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

const PostMiniCard = ({ post, isDraft }) => (
  <Link to={`/post/${post.id}`} className="ink-post-card" style={{ position: "relative" }}>
    {isDraft && <span className="ink-draft-badge" style={{ position: "absolute", top: 12, right: 12 }}>Draft</span>}
    <p className="ink-post-author">{post.blogUser}</p>
    <h2 className="ink-post-title">{post.title}</h2>
    <p className="ink-post-excerpt">{post.content.slice(0, 200)}...</p>
    <div className="ink-post-footer">
      <div className="ink-post-dates">
        <span>Posted: {post.createdOn}</span>
        {post.views > 0 && (
          <span style={{ color: "var(--text-tertiary)" }}>👁 {post.views}</span>
        )}
      </div>
      <span className="ink-post-readmore">{readTime(post.content)} min read →</span>
    </div>
  </Link>
);

const UserProfilePage = () => {
  const { username } = useParams();
  const authCtx = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isOwnProfile = authCtx.isLoggedIn && authCtx.userName === username;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const allPosts = await getAllPosts();
      setPosts(allPosts.filter(p => p.blogUser === username));

      if (isOwnProfile) {
        const myDrafts = await getMyDrafts(authCtx.token);
        setDrafts(myDrafts);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [username, isOwnProfile]);

  const totalPosts = posts.length + (isOwnProfile ? drafts.length : 0);

  return (
    <div className="ink-post-page page-fade-in">
      <div className="ink-post-shell" style={{ maxWidth: 860 }}>
        <Link to="/" className="ink-back-btn">← Back</Link>

        {/* Profile header */}
        <div style={{
          display: "flex", alignItems: "center", gap: "1.25rem",
          marginBottom: "2rem", paddingBottom: "1.5rem",
          borderBottom: "1px solid var(--border)"
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "var(--surface-3)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.25rem", fontWeight: 700, color: "var(--text-secondary)",
            flexShrink: 0, boxShadow: "var(--shadow-sm)"
          }}>
            {getInitials(username)}
          </div>
          <div>
            <h1 style={{
              margin: 0, fontSize: "1.75rem", fontWeight: 700,
              letterSpacing: "-0.04em", color: "var(--text-primary)"
            }}>{username}</h1>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {isLoading ? "…" : `${totalPosts} post${totalPosts !== 1 ? "s" : ""}${isOwnProfile && drafts.length > 0 ? ` (${drafts.length} draft${drafts.length !== 1 ? "s" : ""})` : ""}`}
            </p>
          </div>
        </div>

        {isLoading && <Loading />}

        {!isLoading && posts.length === 0 && drafts.length === 0 && (
          <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem 0" }}>
            No posts yet.
          </p>
        )}

        {/* Published posts */}
        {!isLoading && posts.length > 0 && (
          <>
            {isOwnProfile && drafts.length > 0 && (
              <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "0.75rem" }}>
                Published
              </p>
            )}
            <div className="ink-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {posts.map(post => <PostMiniCard key={post.id} post={post} isDraft={false} />)}
            </div>
          </>
        )}

        {/* Drafts section — own profile only */}
        {!isLoading && isOwnProfile && drafts.length > 0 && (
          <>
            <div style={{ margin: "2rem 0 0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", color: "var(--text-tertiary)", margin: 0 }}>
                Drafts
              </p>
              <span className="ink-draft-badge">{drafts.length}</span>
            </div>
            <div className="ink-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {drafts.map(post => <PostMiniCard key={post.id} post={post} isDraft={true} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
