const BLOG_DOMAIN = process.env.REACT_APP_API_URL || "";

const getHeaders = (token, extraHeaders = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error || payload?.message || payload?.userName || response.statusText || "Request failed";
    throw new Error(message);
  }
  return payload;
};

export const getAllPosts = async () => {
  const response = await fetch(`${BLOG_DOMAIN}/api/posts`);
  if (!response.ok) return [];
  return response.json();
};

export const getPostById = async (id) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/posts/${id}`);
  if (!response.ok) {
    throw new Error(`Post with id ${id} not found`);
  }
  return response.json();
};

export const submitNewPost = async (newPost, token) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/posts`, {
    method: "POST",
    body: JSON.stringify(newPost),
    headers: getHeaders(token),
  });
  return parseResponse(response);
};

export const updatePost = async (updatedPost, token) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/posts`, {
    method: "PUT",
    body: JSON.stringify(updatedPost),
    headers: getHeaders(token),
  });
  return parseResponse(response);
};

export const deletePost = async (postId, token) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/posts/${postId}`, {
    method: "DELETE",
    headers: getHeaders(token, { "Content-Type": "application/json" }),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete post: ${response.statusText}`);
  }
  return true;
};

export const submitNewComment = async (newComment, token) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/comments`, {
    method: "POST",
    body: JSON.stringify(newComment),
    headers: getHeaders(token),
  });
  return parseResponse(response);
};

export const updateComment = async (updatedComment, token) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/comments`, {
    method: "PUT",
    body: JSON.stringify(updatedComment),
    headers: getHeaders(token),
  });
  return parseResponse(response);
};

export const deleteComment = async (commentId, token) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/comments/${commentId}`, {
    method: "DELETE",
    headers: getHeaders(token, { "Content-Type": "application/json" }),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete comment: ${response.statusText}`);
  }
  return true;
};

export const register = async (registerRequest) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/auth/signup`, {
    method: "POST",
    body: JSON.stringify(registerRequest),
    headers: getHeaders(),
  });
  return parseResponse(response);
};

export const login = async (loginRequest) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(loginRequest),
    headers: getHeaders(),
  });
  return parseResponse(response);
};

export const incrementPostViews = async (postId) => {
  try {
    await fetch(`${BLOG_DOMAIN}/api/posts/${postId}/view`, { method: "POST" });
  } catch (_) {
    // intentionally silent for analytics
  }
};

export const likePost = async (postId) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/posts/${postId}/like`, {
    method: "POST",
  });
  return parseResponse(response);
};

export const togglePublishPost = async (postId, published, token) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/posts/${postId}/publish`, {
    method: "PUT",
    body: JSON.stringify({ published }),
    headers: getHeaders(token),
  });
  return parseResponse(response);
};

export const getMyDrafts = async (token) => {
  const response = await fetch(`${BLOG_DOMAIN}/api/posts/drafts`, {
    headers: getHeaders(token),
  });
  if (!response.ok) return [];
  return response.json();
};
