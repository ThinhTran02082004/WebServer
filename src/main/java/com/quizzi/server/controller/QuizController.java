package com.quizzi.server.controller;
import com.quizzi.server.model.Quiz;
import com.quizzi.server.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/quizzes") // Tất cả URL trong class này sẽ bắt đầu bằng /api/quizzes
public class QuizController {

    @Autowired // Tự động inject QuizRepository vào
    private QuizRepository quizRepository;

    // API để tạo một quiz mới - chỉ cho admin
    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestHeader("User-Role") String role, @RequestBody Quiz quiz) {
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body("Only admin can create quizzes");
        }
        return ResponseEntity.ok(quizRepository.save(quiz));
    }

    // API để lấy tất cả các quiz
    @GetMapping
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    // API để cập nhật một quiz - chỉ cho admin
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuiz(
            @RequestHeader("User-Role") String role,
            @PathVariable String id,
            @RequestBody Quiz updatedQuiz) {
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body("Only admin can update quizzes");
        }

        Optional<Quiz> quiz = quizRepository.findById(id);
        if (quiz.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        updatedQuiz.setId(id); // Đảm bảo giữ nguyên ID
        return ResponseEntity.ok(quizRepository.save(updatedQuiz));
    }

    // API để lấy một quiz theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable String id) {
        // Return 404 if id is null or "null"
        if (id == null || "null".equals(id)) {
            return ResponseEntity.notFound().build();
        }
        
        Optional<Quiz> quiz = quizRepository.findById(id);
        return quiz.map(ResponseEntity::ok) // Nếu tìm thấy, trả về 200 OK
                .orElseGet(() -> ResponseEntity.notFound().build()); // Nếu không, trả về 404 Not Found
    }

    // API để xóa một quiz theo ID - chỉ cho admin
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(
            @RequestHeader("User-Role") String role,
            @PathVariable String id) {
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body("Only admin can delete quizzes");
        }

        Optional<Quiz> quiz = quizRepository.findById(id);
        if (quiz.isPresent()) {
            quizRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
