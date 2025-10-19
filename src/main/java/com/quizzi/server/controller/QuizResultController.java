package com.quizzi.server.controller;

import com.quizzi.server.model.Quiz;
import com.quizzi.server.model.QuizResult;
import com.quizzi.server.repository.QuizRepository;
import com.quizzi.server.repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/results")
public class QuizResultController {

    @Autowired
    private QuizResultRepository quizResultRepository;
    
    @Autowired
    private QuizRepository quizRepository;

    @PostMapping
    public ResponseEntity<QuizResult> saveResult(@RequestBody QuizResult result) {
        // Validate required fields
        if (result.getQuizId() == null || result.getUserId() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Ensure dateCompleted is set to current time if not provided
        if (result.getDateCompleted() == null) {
            result.setDateCompleted(new Date());
        }

        // Lấy thông tin quiz để lưu title
        Optional<Quiz> quiz = quizRepository.findById(result.getQuizId());
        quiz.ifPresent(q -> result.setQuizTitle(q.getTitle()));
        
        // If quiz not found, still save the result but mark quiz as deleted
        if (quiz.isEmpty()) {
            result.setQuizTitle("Deleted Quiz");
        }
        
        QuizResult savedResult = quizResultRepository.save(result);
        return ResponseEntity.ok(savedResult);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizResult>> getUserResults(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<QuizResult> results = quizResultRepository.findByUserIdOrderByDateCompletedDesc(userId);
        
        // Simple pagination
        int start = page * size;
        int end = Math.min(start + size, results.size());
        
        if (start >= results.size()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<QuizResult> paginatedResults = results.subList(start, end);
        return ResponseEntity.ok(paginatedResults);
    }

    @GetMapping("/user/{userId}/quiz/{quizId}")
    public ResponseEntity<List<QuizResult>> getUserQuizResults(
            @PathVariable String userId,
            @PathVariable String quizId) {
        List<QuizResult> results = quizResultRepository.findByUserIdAndQuizId(userId, quizId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{resultId}")
    public ResponseEntity<QuizResult> getQuizResult(@PathVariable String resultId) {
        Optional<QuizResult> result = quizResultRepository.findById(resultId);
        return result.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/quiz/{quizId}/count")
    public ResponseEntity<Map<String, Integer>> getQuizParticipationCount(@PathVariable String quizId) {
        List<QuizResult> results = quizResultRepository.findByQuizId(quizId);
        int participationCount = results.size();
        
        Map<String, Integer> response = new HashMap<>();
        response.put("participationCount", participationCount);
        
        return ResponseEntity.ok(response);
    }
}