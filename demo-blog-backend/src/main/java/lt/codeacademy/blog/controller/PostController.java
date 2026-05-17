package lt.codeacademy.blog.controller;

import com.fasterxml.jackson.databind.JsonNode;
import lt.codeacademy.blog.dto.ContentRequest;
import lt.codeacademy.blog.entity.BlogUser;
import lt.codeacademy.blog.entity.Post;
import lt.codeacademy.blog.repository.PostRepository;
import lt.codeacademy.blog.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostRepository postRepository;
    private final AuthService authService;

    public PostController(PostRepository postRepository, AuthService authService) {
        this.postRepository = postRepository;
        this.authService = authService;
    }

    /* ── GET /posts  — public feed (published only) ── */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<JsonNode>> posts() {
        return ResponseEntity.ok(
                postRepository.findByPublishedTrue().stream()
                        .map(Post::asJson)
                        .toList()
        );
    }

    /* ── GET /posts/drafts  — authenticated user's own drafts ── */
    @GetMapping(value = "/drafts", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    public ResponseEntity<List<JsonNode>> myDrafts() {
        BlogUser currentUser = authService.getBlogUser().orElseThrow();
        return ResponseEntity.ok(
                postRepository.findDraftsByUsername(currentUser.getUserName()).stream()
                        .map(Post::asJson)
                        .toList()
        );
    }

    /* ── GET /posts/{id}  — full post with comments ── */
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> post(@PathVariable Long id) {
        return postRepository.findById(id)
                .map(Post::asJsonWithComments)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── POST /posts/{id}/view  — increment view counter ── */
    @PostMapping(value = "/posts/{id}/view")
    public ResponseEntity<Void> incrementView(@PathVariable Long id) {
        postRepository.findById(id).ifPresent(post -> {
            post.setViews(post.getViews() + 1);
            postRepository.save(post);
        });
        return ResponseEntity.noContent().build();
    }

    /* ── POST /posts/{id}/like  — increment like counter ── */
    @PostMapping(value = "/posts/{id}/like")
    public ResponseEntity<JsonNode> likePost(@PathVariable Long id) {
        return postRepository.findById(id)
                .map(post -> {
                    post.setLikeCount(post.getLikeCount() + 1);
                    return ResponseEntity.ok(postRepository.save(post).asJson());
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── POST /posts  — create ── */
    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    public ResponseEntity<JsonNode> createPost(@Valid @RequestBody ContentRequest contentRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postRepository.save(newPost(contentRequest)).asJson());
    }

    /* ── PUT /posts  — update content ── */
    @PutMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    public ResponseEntity<JsonNode> updatePost(@Valid @RequestBody ContentRequest contentRequest) {
        return postRepository.findById(contentRequest.getId())
                .map(post -> post.updateContent(contentRequest.getContent()))
                .map(post -> ResponseEntity.ok(postRepository.save(post).asJson()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── PUT /posts/{id}/publish  — toggle published status ── */
    @PutMapping(value = "/{id}/publish")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    public ResponseEntity<JsonNode> togglePublish(
            @PathVariable Long id,
            @Valid @RequestBody ContentRequest contentRequest) {

        Optional<Post> opt = postRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Post post = opt.get();
        BlogUser currentUser = authService.getBlogUser().orElseThrow();

        boolean isOwner = post.getBlogUser().getUserName().equals(currentUser.getUserName());
        boolean isAdmin = currentUser.getAuthority().contains("ADMIN");
        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        post.setPublished(contentRequest.isPublished());
        return ResponseEntity.ok(postRepository.save(post).asJson());
    }

    /* ── DELETE /posts/{id} ── */
    @DeleteMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    public ResponseEntity<HttpStatus> deletePost(@PathVariable Long id) {
        postRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /* ── helpers ── */
    private Post newPost(ContentRequest req) {
        Post post = new Post(
                req.getTitle(),
                req.getContent(),
                LocalDate.now(),
                LocalDate.now(),
                authService.getBlogUser().orElseThrow(),
                new ArrayList<>()
        );
        post.setPublished(req.isPublished());
        return post;
    }
}

