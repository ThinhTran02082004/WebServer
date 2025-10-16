package com.quizzi.server.controller;

import com.quizzi.server.model.ActiveQuizCount;
import com.quizzi.server.model.CursorPosition;
import com.quizzi.server.service.QuizActiveUsersService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class QuizWebSocketController {
    private final QuizActiveUsersService activeUsersService;

    public QuizWebSocketController(QuizActiveUsersService activeUsersService) {
        this.activeUsersService = activeUsersService;
    }

    @MessageMapping("/quiz/{quizId}/join")
    @SendTo("/topic/quiz/{quizId}/active-users")
    public ActiveQuizCount handleUserJoined(@DestinationVariable String quizId) {
        activeUsersService.userJoinedQuiz(quizId);
        return new ActiveQuizCount(quizId, activeUsersService.getActiveUsers(quizId));
    }

    @MessageMapping("/quiz/{quizId}/leave")
    @SendTo("/topic/quiz/{quizId}/active-users")
    public ActiveQuizCount handleUserLeft(@DestinationVariable String quizId) {
        activeUsersService.userLeftQuiz(quizId);
        return new ActiveQuizCount(quizId, activeUsersService.getActiveUsers(quizId));
    }

    @MessageMapping("/quiz/{quizId}/cursor")
    @SendTo("/topic/quiz/{quizId}/cursors")
    public CursorPosition handleCursorMove(@DestinationVariable String quizId, CursorPosition cursorPosition) {
        return cursorPosition;
    }
}