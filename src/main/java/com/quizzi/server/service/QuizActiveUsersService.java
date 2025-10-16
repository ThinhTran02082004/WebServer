package com.quizzi.server.service;

import com.quizzi.server.model.ActiveQuizCount;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QuizActiveUsersService {
    private final Map<String, Integer> activeUsersPerQuiz = new ConcurrentHashMap<>();
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public QuizActiveUsersService() {
    }

    public void userJoinedQuiz(String quizId) {
        int currentCount = activeUsersPerQuiz.getOrDefault(quizId, 0);
        activeUsersPerQuiz.put(quizId, currentCount + 1);
        broadcastActiveUsers(quizId);
    }

    public void userLeftQuiz(String quizId) {
        int currentCount = activeUsersPerQuiz.getOrDefault(quizId, 1);
        if (currentCount > 0) {
            activeUsersPerQuiz.put(quizId, currentCount - 1);
            broadcastActiveUsers(quizId);
        }
    }

    private void broadcastActiveUsers(String quizId) {
        int count = activeUsersPerQuiz.getOrDefault(quizId, 0);
        ActiveQuizCount activeQuizCount = new ActiveQuizCount(quizId, count);
        messagingTemplate.convertAndSend("/topic/quiz/" + quizId + "/active-users", activeQuizCount);
    }

    public int getActiveUsers(String quizId) {
        return activeUsersPerQuiz.getOrDefault(quizId, 0);
    }
}