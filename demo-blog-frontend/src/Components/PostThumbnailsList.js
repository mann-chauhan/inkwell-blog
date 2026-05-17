import React from "react";
import PostThumbnail from "./PostThumbnail";
const PostThumbnailsList = ({ posts }) => posts.map(post => <PostThumbnail key={post.id} post={post} />);
export default PostThumbnailsList;
