package com.quizzi.server.model;

public class ActiveQuizCount {
    private String quizId;
    private int activeUsers;

    public ActiveQuizCount(String quizId, int activeUsers) {
        this.quizId = quizId;
        this.activeUsers = activeUsers;
    }

    public String getQuizId() {
        return quizId;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public int getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(int activeUsers) {
        this.activeUsers = activeUsers;
    }
}