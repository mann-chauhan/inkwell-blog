import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllPosts } from "../lib/api";
import ScrollToTop from "../Components/ScrollToTop";

/* ── helpers ── */
function readTime(content = "") {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ── skeleton ── */
const SkeletonCard = () => (
  <div className="ink-skeleton" style={{ height: 220 }}>
    <div className="ink-skel-line" style={{ width: "40%", marginBottom: "1rem" }} />
    <div className="ink-skel-line" style={{ width: "75%" }} />
    <div className="ink-skel-line" style={{ width: "90%" }} />
    <div className="ink-skel-line" style={{ width: "65%" }} />
  </div>
);

/* ── search icon ── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/* ── sort/filter icons ── */
const SortIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="15" y2="12"/>
    <line x1="3" y1="18" x2="9" y2="18"/>
  </svg>
);

const POSTS_PER_PAGE = 9;

const SORT_OPTIONS = [
  { value: "newest",       label: "Newest first"  },
  { value: "oldest",       label: "Oldest first"  },
  { value: "most_comments",label: "Most comments" },
  { value: "longest",      label: "Longest read"  },
];

/* ══════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════ */
const MainPage = () => {
  const [posts, setPosts]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery]         = useState("");
  const [sort, setSort]           = useState("newest");
  const [author, setAuthor]       = useState("all");
  const [page, setPage]           = useState(1);

  useEffect(() => {
    setIsLoading(true);
    getAllPosts()
      .then(data => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load posts:", err);
        setIsLoading(false);
      });
  }, []);

  /* reset page on filter/search change */
  useEffect(() => { setPage(1); }, [query, sort, author]);

  /* unique authors for filter */
  const authors = useMemo(() => {
    const names = [...new Set(posts.map(p => p.blogUser))].sort();
    return names;
  }, [posts]);

  /* filtered + sorted posts */
  const filtered = useMemo(() => {
    let result = [...posts];

    /* search */
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.blogUser.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      );
    }

    /* author filter */
    if (author !== "all") {
      result = result.filter(p => p.blogUser === author);
    }

    /* sort */
    switch (sort) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdOn) - new Date(b.createdOn));
        break;
      case "most_comments":
        result.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
        break;
      case "longest":
        result.sort((a, b) => b.content.length - a.content.length);
        break;
      default: /* newest */
        result.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
    }

    return result;
  }, [posts, query, sort, author]);

  /* pagination */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const paginated   = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div className="ink-page page-fade-in">
      <div className="ink-grid-wrap">

        {/* ── toolbar ── */}
        {!isLoading && (
          <div className="ink-toolbar">

            {/* search */}
            <div className="ink-search-wrap">
              <SearchIcon />
              <input
                className="ink-search-input"
                type="text"
                placeholder="Search posts…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button className="ink-search-clear" onClick={() => setQuery("")} aria-label="Clear">
                  ✕
                </button>
              )}
            </div>

            <div className="ink-toolbar-right">
              {/* author filter */}
              <div className="ink-select-wrap">
                <select
                  className="ink-select"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                >
                  <option value="all">All authors</option>
                  {authors.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* sort */}
              <div className="ink-select-wrap">
                <SortIcon />
                <select
                  className="ink-select"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* results count */}
        {!isLoading && (
          <p className="ink-results-count">
            {filtered.length === posts.length
              ? `${posts.length} post${posts.length !== 1 ? "s" : ""}`
              : `${filtered.length} of ${posts.length} posts`
            }
          </p>
        )}

        {/* grid */}
        <div className="ink-grid">
          {isLoading
            ? [1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)
            : paginated.length > 0
              ? paginated.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              : (
                <div style={{
                  gridColumn: "1 / -1", textAlign: "center",
                  padding: "4rem 0", color: "var(--text-secondary)"
                }}>
                  <p style={{ fontSize: "1rem", margin: 0 }}>No posts found</p>
                  <button
                    className="ink-btn-ghost"
                    style={{ marginTop: "1rem" }}
                    onClick={() => { setQuery(""); setAuthor("all"); }}
                  >
                    Clear filters
                  </button>
                </div>
              )
          }
        </div>

        {/* pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="ink-pagination">
            <button
              className="ink-page-btn"
              disabled={page === 1}
              onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              ← Prev
            </button>

            <div className="ink-page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === "..." ? (
                    <span key={`ellipsis-${i}`} className="ink-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={n}
                      className={`ink-page-num${page === n ? " active" : ""}`}
                      onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    >
                      {n}
                    </button>
                  )
                )
              }
            </div>

            <button
              className="ink-page-btn"
              disabled={page === totalPages}
              onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <ScrollToTop />
    </div>
  );
};

/* ── post card ── */
const PostCard = ({ post }) => {
  const navigate = useNavigate();
  return (
    <div
      className="ink-post-card"
      onClick={() => navigate(`/post/${post.id}`)}
      style={{ cursor: "pointer" }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate(`/post/${post.id}`);
      }}
      role="button"
      tabIndex={0}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
        <Link
          to={`/user/${encodeURIComponent(post.blogUser)}`}
          className="ink-author-chip"
          style={{ marginBottom: 0, textDecoration: "none" }}
          onClick={e => e.stopPropagation()}
        >
          <div className="ink-author-avatar">{getInitials(post.blogUser)}</div>
          <span className="ink-author-name">{post.blogUser}</span>
        </Link>
      </div>

      <h2 className="ink-post-title">{post.title}</h2>
      <p className="ink-post-excerpt">{post.content.slice(0, 200)}...</p>

      <div className="ink-post-footer">
        <div className="ink-post-dates">
          <span>Posted: {post.createdOn}</span>
          {post.comments > 0 && (
            <span style={{ color: "var(--text-tertiary)" }}>
              💬 {post.comments}
            </span>
          )}
          {post.views > 0 && (
            <span style={{ color: "var(--text-tertiary)" }}>👁 {post.views}</span>
          )}
          {post.likeCount > 0 && (
            <span style={{ color: "var(--text-tertiary)" }}>♥ {post.likeCount}</span>
          )}
        </div>
        <span className="ink-post-readmore">
          {readTime(post.content)} min read →
        </span>
      </div>
    </div>
  );
};

export default MainPage;
