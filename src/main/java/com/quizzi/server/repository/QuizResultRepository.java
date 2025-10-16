package com.quizzi.server.repository;

import com.quizzi.server.model.QuizResult;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuizResultRepository extends MongoRepository<QuizResult, String> {
    List<QuizResult> findByUserId(String userId);
    List<QuizResult> findByUserIdAndQuizId(String userId, String quizId);
}