package com.quizzi.server.model;

import lombok.Data;

import java.util.List;

@Data // Lombok tự tạo getter, setter, constructor...
public class Question {
    private String questionText;
    private List<String> options;
    private int correctAnswerIndex;
}
