package lt.codeacademy.blog.dto;

import javax.validation.constraints.Size;

public class ContentRequest {
    private Long id;

    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 50000, message = "Content must not exceed 50000 characters")
    private String content;

    private boolean published = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }
}
