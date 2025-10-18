package com.quizzi.server.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.List;

@Data
@Document(collection = "quizzi") // Tên của collection trong MongoDB
public class Quiz {
    @Id
    private String id; // MongoDB sẽ tự tạo ID
    private String title;
    private List<Question> questions;
    private String createdBy; // ID của người tạo quiz
}
