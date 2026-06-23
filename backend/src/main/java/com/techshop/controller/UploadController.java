package com.techshop.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;

@RestController
@RequestMapping("/api/admin/uploads")
public class UploadController {
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");
    private final Path uploadDir;

    public UploadController(@Value("${app.upload-dir}") String uploadDir) {
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @PostMapping
    Map<String, String> upload(
            @RequestParam MultipartFile file,
            @RequestParam(defaultValue = "products") String folder) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Vui lòng chọn ảnh");
        if (file.getSize() > 5 * 1024 * 1024) throw new IllegalArgumentException("Ảnh không được vượt quá 5MB");
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc GIF");
        }

        String extension = extension(file.getOriginalFilename(), file.getContentType());
        Path targetDir = uploadDir.resolve(folder).normalize();
        if (!targetDir.startsWith(uploadDir)) throw new IllegalArgumentException("Đường dẫn upload không hợp lệ");
        Files.createDirectories(targetDir);
        
        // Giữ nguyên tên gốc, thêm timestamp để tránh trùng lặp đè file
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = UUID.randomUUID().toString() + extension;
        } else {
            originalName = originalName.replaceAll("[^a-zA-Z0-9\\.\\-]", "_"); // Làm sạch tên file
            originalName = System.currentTimeMillis() + "_" + originalName;
        }

        String filename = originalName;
        Path targetPath = targetDir.resolve(filename);

        // Tự động tối ưu hóa hình ảnh (nén dung lượng + giới hạn kích thước)
        try {
            net.coobird.thumbnailator.Thumbnails.of(file.getInputStream())
                    .size(1920, 1920) // Giới hạn kích thước tối đa (nếu ảnh quá lớn)
                    .outputQuality(0.8) // Nén 80% chất lượng giúp giảm dung lượng đáng kể, không giảm độ nét mắt thường
                    .toFile(targetPath.toFile());
        } catch (Exception e) {
            // Fallback nếu ảnh lỗi định dạng hoặc GIF không thể xử lý bằng Thumbnailator
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        }

        return Map.of("url", "/uploads/" + (folder.isEmpty() ? filename : folder + "/" + filename));
    }

    @PostMapping("/ckeditor")
    Map<String, Object> uploadCkeditor(
            @RequestParam("upload") MultipartFile file,
            @RequestParam(defaultValue = "products") String folder) throws IOException {
        
        if (file.isEmpty()) throw new IllegalArgumentException("Vui lòng chọn ảnh");
        if (file.getSize() > 5 * 1024 * 1024) throw new IllegalArgumentException("Ảnh không được vượt quá 5MB");
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc GIF");
        }

        String extension = extension(file.getOriginalFilename(), file.getContentType());
        Path targetDir = uploadDir.resolve(folder).normalize();
        if (!targetDir.startsWith(uploadDir)) throw new IllegalArgumentException("Đường dẫn upload không hợp lệ");
        Files.createDirectories(targetDir);
        
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = UUID.randomUUID().toString() + extension;
        } else {
            originalName = originalName.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
            originalName = System.currentTimeMillis() + "_" + originalName;
        }

        String filename = originalName;
        Path targetPath = targetDir.resolve(filename);

        try {
            net.coobird.thumbnailator.Thumbnails.of(file.getInputStream())
                    .size(1920, 1920)
                    .outputQuality(0.8)
                    .toFile(targetPath.toFile());
        } catch (Exception e) {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        }

        return Map.of(
            "uploaded", 1,
            "fileName", filename,
            "url", "/uploads/" + (folder.isEmpty() ? filename : folder + "/" + filename)
        );
    }

    @GetMapping("/folders")
    public ResponseEntity<List<String>> listFolders() {
        List<String> folders = new ArrayList<>();
        folders.add(""); // root
        try {
            if (Files.exists(uploadDir)) {
                Files.walk(uploadDir)
                     .filter(Files::isDirectory)
                     .forEach(path -> {
                         if (!path.equals(uploadDir)) {
                             String relativePath = uploadDir.relativize(path).toString().replace("\\", "/");
                             folders.add(relativePath);
                         }
                     });
            }
            Collections.sort(folders);
            return ResponseEntity.ok(folders);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/folders")
    public ResponseEntity<?> createFolder(@RequestBody Map<String, String> body) {
        String path = body.get("path");
        if (path == null || path.trim().isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Đường dẫn không hợp lệ"));
        try {
            Path targetPath = uploadDir.resolve(path).normalize();
            if (!targetPath.startsWith(uploadDir)) return ResponseEntity.badRequest().body(Map.of("message", "Đường dẫn không hợp lệ"));
            if (Files.exists(targetPath)) return ResponseEntity.badRequest().body(Map.of("message", "Thư mục đã tồn tại"));
            Files.createDirectories(targetPath);
            return ResponseEntity.ok(Map.of("message", "Tạo thư mục thành công"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Lỗi tạo thư mục"));
        }
    }

    @PutMapping("/rename")
    public ResponseEntity<?> rename(@RequestBody Map<String, String> body) {
        String oldUrl = body.get("oldUrl"); 
        String newName = body.get("newName"); 
        if (oldUrl == null || !oldUrl.startsWith("/uploads/") || newName == null || newName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Dữ liệu không hợp lệ"));
        }
        try {
            String relativePath = oldUrl.substring("/uploads/".length());
            Path targetPath = uploadDir.resolve(relativePath).normalize();
            if (!targetPath.startsWith(uploadDir) || !Files.exists(targetPath)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Đường dẫn không hợp lệ"));
            }
            Path newPath = targetPath.resolveSibling(newName);
            if (Files.exists(newPath)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tên đã tồn tại"));
            }
            Files.move(targetPath, newPath);
            return ResponseEntity.ok(Map.of("message", "Đổi tên thành công"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Lỗi đổi tên"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listFiles() {
        List<Map<String, Object>> files = new ArrayList<>();
        try {
            if (Files.exists(uploadDir)) {
                Files.walk(uploadDir)
                     .filter(Files::isRegularFile)
                     .forEach(path -> {
                         try {
                             BasicFileAttributes attr = Files.readAttributes(path, BasicFileAttributes.class);
                             Map<String, Object> fileInfo = new HashMap<>();
                             String relativePath = uploadDir.relativize(path).toString().replace("\\", "/");
                             fileInfo.put("url", "/uploads/" + relativePath);
                             fileInfo.put("name", path.getFileName().toString());
                             fileInfo.put("folder", path.getParent().getFileName().toString());
                             fileInfo.put("size", attr.size());
                             fileInfo.put("createdAt", attr.creationTime().toMillis());
                             files.add(fileInfo);
                         } catch (IOException e) {
                             // Ignore
                         }
                     });
            }
            files.sort((a, b) -> Long.compare((Long) b.get("createdAt"), (Long) a.get("createdAt")));
            return ResponseEntity.ok(files);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteFile(@RequestParam String url) {
        if (url == null || !url.startsWith("/uploads/")) {
            return ResponseEntity.badRequest().body(Map.of("message", "URL không hợp lệ"));
        }
        try {
            String relativePath = url.substring("/uploads/".length());
            Path targetPath = uploadDir.resolve(relativePath).normalize();
            
            if (!targetPath.startsWith(uploadDir)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Đường dẫn không hợp lệ"));
            }
            if (Files.exists(targetPath)) {
                org.springframework.util.FileSystemUtils.deleteRecursively(targetPath);
                return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
            }
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Lỗi server khi xóa file/thư mục"));
        }
    }

    private String extension(String originalName, String contentType) {
        if (originalName != null && originalName.lastIndexOf('.') >= 0) {
            String ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
            if (Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif").contains(ext)) return ext;
        }
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
