package com.techshop.config;

import com.techshop.entity.Post;
import com.techshop.repository.PostRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class PageDataSeeder {

    @Bean
    public CommandLineRunner initPages(PostRepository postRepository) {
        return args -> {
            seedPage(postRepository, "faq", "Câu hỏi thường gặp", "<p>Đây là trang câu hỏi thường gặp. Bạn có thể chỉnh sửa nội dung này.</p>");
            seedPage(postRepository, "about", "Giới thiệu", "<p>Đây là trang giới thiệu về Tech Shop. Bạn có thể chỉnh sửa nội dung này.</p>");
            seedPage(postRepository, "warranty", "Chính sách bảo hành", "<p>Đây là trang chính sách bảo hành. Bạn có thể chỉnh sửa nội dung này.</p>");
            seedPage(postRepository, "installment", "Mua trả góp", "<p>Đây là trang hướng dẫn mua trả góp. Bạn có thể chỉnh sửa nội dung này.</p>");
        };
    }

    private void seedPage(PostRepository repo, String slug, String title, String content) {
        if (!repo.existsBySlug(slug)) {
            Post post = Post.builder()
                    .slug(slug)
                    .title(title)
                    .content(content)
                    .type("PAGE")
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            repo.save(post);
        }
    }
}
