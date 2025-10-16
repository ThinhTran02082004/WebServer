package com.quizzi.server.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.quizzi.server.model.Quiz;

public interface QuizRepository extends MongoRepository<Quiz, String> {
    // Spring Data sẽ tự động hiểu các phương thức dựa trên tên
}
