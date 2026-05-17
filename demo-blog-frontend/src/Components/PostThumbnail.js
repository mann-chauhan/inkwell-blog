import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PostThumbnail = ({ post }) => {
  const { t } = useTranslation();
  return (
    <Link to={"/post/" + post.id} as={NavLink} className="ink-post-card">
      <p className="ink-post-author">{post.blogUser}</p>
      <h2 className="ink-post-title">{post.title}</h2>
      <p className="ink-post-excerpt">{post.content.slice(0, 200) + "..."}</p>
      <div className="ink-post-footer">
        <div className="ink-post-dates">
          <span>{t("posted")}: {post.createdOn}</span>
          <span>{t("edited")}: {post.updatedOn}</span>
        </div>
        <span className="ink-post-readmore">Read →</span>
      </div>
    </Link>
  );
};
export default PostThumbnail;
