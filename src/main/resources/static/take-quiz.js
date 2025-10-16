let currentQuiz = null;
let currentQuestion = 0;
let answers = [];
let startTime = null;
let stompClient = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Get quiz ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');
    
    if (!quizId) {
        alert('No quiz specified');
        window.location.href = '/';
        return;
    }

    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login to take the quiz');
        window.location.href = '/';
        return;
    }

    // Load quiz
    try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) throw new Error('Failed to load quiz');
        
        currentQuiz = await response.json();
        startTime = new Date();
        
        // Initialize quiz
        initializeQuiz();
        showQuestion(0);

        // Connect to WebSocket
        connectWebSocket(quizId);
    } catch (error) {
        console.error('Error loading quiz:', error);
        alert('Could not load the quiz. Please try again or contact support.');
    }
});

function initializeQuiz() {
    document.getElementById('quiz-title').textContent = currentQuiz.title;
    document.getElementById('total-questions').textContent = `of ${currentQuiz.questions.length}`;
    
    // Initialize empty answers array
    answers = new Array(currentQuiz.questions.length).fill(null);
    
    // Set up navigation buttons
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const submitButton = document.getElementById('submit-quiz');

    prevButton.addEventListener('click', () => {
        if (currentQuestion > 0) {
            showQuestion(currentQuestion - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentQuestion < currentQuiz.questions.length - 1) {
            showQuestion(currentQuestion + 1);
        }
    });

    submitButton.addEventListener('click', submitQuiz);
}

function showQuestion(index) {
    currentQuestion = index;
    const question = currentQuiz.questions[index];
    const isQuizSubmitted = document.querySelector('.result-summary') !== null;
    
    // Update progress
    document.getElementById('current-question').textContent = `Question ${index + 1}`;
    document.querySelector('.progress-fill').style.width = 
        `${((index + 1) / currentQuiz.questions.length) * 100}%`;

    // Show/hide navigation buttons
    document.getElementById('prev-button').style.visibility = index === 0 ? 'hidden' : 'visible';
    document.getElementById('next-button').style.display = 
        index === currentQuiz.questions.length - 1 ? 'none' : 'block';
    document.getElementById('submit-quiz').style.display = 
        index === currentQuiz.questions.length - 1 ? 'block' : 'none';

    // Display question
    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div class="question">
            <div class="question-text">${question.questionText}</div>
            <div class="options-list">
                ${question.options.map((option, optIndex) => {
                    const isCorrect = optIndex === question.correctAnswerIndex;
                    const isUserAnswer = answers[index] === optIndex;
                    const classes = [];
                    
                    if (isQuizSubmitted) {
                        if (isCorrect) {
                            classes.push('correct');
                        } else if (isUserAnswer) {
                            classes.push('incorrect');
                        }
                        if (isUserAnswer) {
                            classes.push('user-selected');
                        }
                    } else if (isUserAnswer) {
                        classes.push('selected');
                    }
                    
                    return `
                        <div class="option-item ${classes.join(' ')}"
                             data-index="${optIndex}">
                            ${option}
                            <span class="answer-icon correct"><i class="fas fa-check"></i></span>
                            <span class="answer-icon incorrect"><i class="fas fa-times"></i></span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    // Add click handlers for options
    container.querySelectorAll('.option-item').forEach(option => {
        option.addEventListener('click', () => {
            // Update selected answer
            const optionIndex = parseInt(option.dataset.index);
            answers[currentQuestion] = optionIndex;
            
            // Update UI
            container.querySelectorAll('.option-item').forEach(opt => 
                opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
}

async function submitQuiz() {
    // Check if all questions are answered
    if (answers.includes(null)) {
        alert('Please answer all questions before submitting');
        return;
    }

    // Calculate score and mark correct/incorrect answers
    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    
    currentQuiz.questions.forEach((question, qIndex) => {
        const userAnswer = answers[qIndex];
        const correctAnswer = question.correctAnswerIndex;
        
        if (userAnswer === correctAnswer) {
            score++;
            correctAnswers++;
        } else {
            incorrectAnswers++;
        }
    });

    // Calculate time taken
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds
    
    // Show results summary
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'result-summary';
    resultsContainer.innerHTML = `
        <div class="result-score">Score: ${score}/${currentQuiz.questions.length}</div>
        <div class="result-stats">
            <div class="stat-item">
                <div class="stat-label">Correct Answers</div>
                <div class="stat-value">${correctAnswers}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Incorrect Answers</div>
                <div class="stat-value">${incorrectAnswers}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Time Taken</div>
                <div class="stat-value">${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s</div>
            </div>
        </div>
    `;
    
    document.getElementById('question-container').prepend(resultsContainer);

    // Disable all option selection
    document.querySelectorAll('.option-item').forEach(option => {
        option.style.pointerEvents = 'none';
    });

    // Save result
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    try {
        // Create question results
        const questionResults = currentQuiz.questions.map((question, index) => ({
            questionText: question.questionText,
            options: question.options,
            correctAnswerIndex: question.correctAnswerIndex,
            userAnswerIndex: answers[index]
        }));

        const result = {
            userId: currentUser.id,
            quizId: currentQuiz._id,
            score: score,
            totalQuestions: currentQuiz.questions.length,
            timeTaken: timeTaken,
            dateCompleted: new Date().toISOString(),
            questionResults: questionResults
        };

        const response = await fetch('/api/results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result)
        });

        if (!response.ok) throw new Error('Failed to save results');

    } catch (error) {
        console.error('Error saving results:', error);
    }

    // Show results
    showResults(score, timeTaken);
}

function showResults(score, timeTaken) {
    const totalQuestions = currentQuiz.questions.length;
    
    // Create success screen
    const successScreen = document.createElement('div');
    successScreen.className = 'success-screen';
    
    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Get appropriate message based on score
    let message = '';
    if (percentage === 100) {
        message = 'Tuyệt vời! Bạn đã hoàn thành xuất sắc!';
    } else if (percentage >= 80) {
        message = 'Rất tốt! Tiếp tục cố gắng nhé!';
    } else if (percentage >= 60) {
        message = 'Khá tốt! Hãy xem lại những câu sai để cải thiện thêm.';
    } else {
        message = 'Đừng nản chí! Hãy thử lại để cải thiện điểm số.';
    }

    successScreen.innerHTML = `
        <div class="success-content">
            <h2>Kết quả bài kiểm tra</h2>
            <div class="success-score">
                ${score}<span class="score-total">/${totalQuestions}</span>
            </div>
            <p>${message}</p>
            <div class="score-details">
                <div class="detail-box">
                    <div class="detail-label">Số câu đúng</div>
                    <div class="detail-value">${score}</div>
                </div>
                <div class="detail-box">
                    <div class="detail-label">Thời gian</div>
                    <div class="detail-value">${formatTime(timeTaken)}</div>
                </div>
            </div>
            <div class="success-actions">
                <button onclick="showIncorrectAnswers()" class="btn-primary">
                    <i class="fas fa-search"></i>
                    Xem câu trả lời sai
                </button>
                <button onclick="window.location.href = '/'" class="btn-home">
                    <i class="fas fa-home"></i>
                    Về trang chủ
                </button>
            </div>
        </div>
    `;

    // Add success screen to document
    document.body.appendChild(successScreen);
    
    // Remove the quiz container to prevent interaction
    document.querySelector('.container').style.display = 'none';

    // Add container for incorrect answers
    const incorrectAnswersContainer = document.createElement('div');
    incorrectAnswersContainer.id = 'incorrect-answers-review';
    incorrectAnswersContainer.className = 'incorrect-answers-review';
    incorrectAnswersContainer.style.display = 'none';
    modal.appendChild(incorrectAnswersContainer);

    // Show modal
    modal.classList.add('active');
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function retryQuiz() {
    // Reset quiz state
    currentQuestion = 0;
    answers = new Array(currentQuiz.questions.length).fill(null);
    startTime = new Date();
    
    // Hide results modal
    document.getElementById('results-modal').classList.remove('active');
    
    // Show first question
    showQuestion(0);
}

function goToQuizList() {
    disconnectWebSocket();
    window.location.href = '/';
}

let cursors = {};

function initializeCursorTracking() {
    document.addEventListener('mousemove', throttle((e) => {
        if (!stompClient || !currentUser) return;
        const quizId = new URLSearchParams(window.location.search).get('id');
        const cursorPosition = {
            quizId: quizId,
            userId: currentUser.id,
            username: currentUser.username,
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight
        };
        stompClient.send(`/app/quiz/${quizId}/cursor`, {}, JSON.stringify(cursorPosition));
    }, 50));
}

function updateRemoteCursor(cursorData) {
    if (cursorData.userId === currentUser.id) return;

    let cursor = cursors[cursorData.userId];
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'remote-cursor';
        cursor.setAttribute('data-username', cursorData.username);
        document.body.appendChild(cursor);
        cursors[cursorData.userId] = cursor;
    }

    const x = cursorData.x * window.innerWidth;
    const y = cursorData.y * window.innerHeight;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
}

// Throttle function to limit cursor update rate
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function removeRemoteCursor(userId) {
    if (cursors[userId]) {
        cursors[userId].remove();
        delete cursors[userId];
    }
}

function connectWebSocket(quizId) {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function() {
        // Subscribe to active users updates
        stompClient.subscribe(`/topic/quiz/${quizId}/active-users`, function(message) {
            const activeCount = JSON.parse(message.body).activeUsers;
            document.getElementById('active-users-count').textContent = activeCount;
        });

        // Subscribe to cursor updates
        stompClient.subscribe(`/topic/quiz/${quizId}/cursors`, function(message) {
            const cursorData = JSON.parse(message.body);
            updateRemoteCursor(cursorData);
        });

        // Notify server that user joined
        stompClient.send(`/app/quiz/${quizId}/join`, {}, JSON.stringify({}));

        // Initialize cursor tracking
        initializeCursorTracking();
    });

    // Handle page unload
    window.addEventListener('beforeunload', function() {
        disconnectWebSocket();
    });
}

function disconnectWebSocket() {
    if (stompClient !== null) {
        const quizId = new URLSearchParams(window.location.search).get('id');
        stompClient.send(`/app/quiz/${quizId}/leave`, {}, JSON.stringify({}));
        stompClient.disconnect();
        
        // Clean up all cursors
        Object.keys(cursors).forEach(userId => {
            removeRemoteCursor(userId);
        });
    }
}