package lt.codeacademy.blog.repository;

import lt.codeacademy.blog.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
@Transactional
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByPublishedTrue();

    @Query("SELECT p FROM Post p WHERE p.blogUser.userName = :username AND p.published = false")
    List<Post> findDraftsByUsername(@Param("username") String username);
}
