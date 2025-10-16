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

    // API để tạo một quiz mới
    @PostMapping
    public Quiz createQuiz(@RequestBody Quiz quiz) {
        return quizRepository.save(quiz);
    }

    // API để lấy tất cả các quiz
    @GetMapping
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    // API để lấy một quiz theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable String id) {
        Optional<Quiz> quiz = quizRepository.findById(id);
        return quiz.map(ResponseEntity::ok) // Nếu tìm thấy, trả về 200 OK
                .orElseGet(() -> ResponseEntity.notFound().build()); // Nếu không, trả về 404 Not Found
    }
}
