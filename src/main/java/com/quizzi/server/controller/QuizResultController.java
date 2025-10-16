package com.quizzi.server.controller;

import com.quizzi.server.model.QuizResult;
import com.quizzi.server.repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class QuizResultController {

    @Autowired
    private QuizResultRepository quizResultRepository;

    @PostMapping
    public ResponseEntity<QuizResult> saveResult(@RequestBody QuizResult result) {
        QuizResult savedResult = quizResultRepository.save(result);
        return ResponseEntity.ok(savedResult);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizResult>> getUserResults(@PathVariable String userId) {
        List<QuizResult> results = quizResultRepository.findByUserId(userId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/user/{userId}/quiz/{quizId}")
    public ResponseEntity<List<QuizResult>> getUserQuizResults(
            @PathVariable String userId,
            @PathVariable String quizId) {
        List<QuizResult> results = quizResultRepository.findByUserIdAndQuizId(userId, quizId);
        return ResponseEntity.ok(results);
    }
}