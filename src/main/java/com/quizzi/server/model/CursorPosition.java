package com.quizzi.server.model;

public class CursorPosition {
    private String quizId;
    private String userId;
    private String username;
    private double x;
    private double y;

    public CursorPosition() {
    }

    public CursorPosition(String quizId, String userId, String username, double x, double y) {
        this.quizId = quizId;
        this.userId = userId;
        this.username = username;
        this.x = x;
        this.y = y;
    }

    public String getQuizId() {
        return quizId;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }
}