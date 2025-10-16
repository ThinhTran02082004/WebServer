document.addEventListener('DOMContentLoaded', () => {
    // Auth state
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Auth elements
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const closeButtons = document.querySelectorAll('.close-modal');
    // Modal handling
    function showModal(modal) {
        modal.classList.add('active');
    }

    function hideModal(modal) {
        modal.classList.remove('active');
    }

    loginBtn.addEventListener('click', () => showModal(loginModal));
    registerBtn.addEventListener('click', () => showModal(registerModal));
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            hideModal(loginModal);
            hideModal(registerModal);
        });
    });

    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(loginModal);
        showModal(registerModal);
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(registerModal);
        showModal(loginModal);
    });

    // Auth form handling
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const data = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(data));
            currentUser = data;
            hideModal(loginModal);
            updateAuthDisplay();
            alert('Login successful!');
        } catch (error) {
            alert(error.message);
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const data = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(data));
            currentUser = data;
            hideModal(registerModal);
            updateAuthDisplay();
            alert('Registration successful!');
        } catch (error) {
            alert(error.message);
        }
    });

    function updateAuthDisplay() {
        if (currentUser) {
            loginBtn.style.display = 'none';
            registerBtn.textContent = currentUser.username;
            registerBtn.onclick = () => {
                if (confirm('Do you want to log out?')) {
                    localStorage.removeItem('currentUser');
                    currentUser = null;
                    updateAuthDisplay();
                    location.reload();
                }
            };
        } else {
            loginBtn.style.display = 'block';
            registerBtn.textContent = 'Register';
            registerBtn.onclick = () => showModal(registerModal);
        }
    }

    // Initialize auth display
    updateAuthDisplay();

    // Star trail effect
    let lastX = 0;
    let lastY = 0;
    let throttleTimer;

    function createStar(x, y, type) {
        const element = document.createElement('div');
        
        if (type === 'star') {
            element.className = 'star';
            element.innerHTML = '⭐';
            element.style.fontSize = Math.random() * 8 + 8 + 'px';
        } else if (type === 'sparkle') {
            element.className = 'sparkle';
            element.style.left = x + Math.random() * 20 - 10 + 'px';
            element.style.top = y + Math.random() * 20 - 10 + 'px';
        } else {
            element.className = 'trail';
            element.style.background = `radial-gradient(circle, var(--primary-light) 0%, transparent 70%)`;
        }

        element.style.left = x + 'px';
        element.style.top = y + 'px';
        document.body.appendChild(element);

        // Xóa element sau khi animation kết thúc
        setTimeout(() => {
            element.remove();
        }, 1000);
    }

    function throttle(callback, limit) {
        if (!throttleTimer) {
            throttleTimer = setTimeout(() => {
                callback();
                throttleTimer = null;
            }, limit);
        }
    }

    document.addEventListener('mousemove', (e) => {
        const currentX = e.clientX;
        const currentY = e.clientY;
        
        // Tính khoảng cách di chuyển
        const distance = Math.hypot(currentX - lastX, currentY - lastY);

        if (distance > 5) { // Chỉ tạo hiệu ứng khi di chuyển đủ xa
            // Tạo ngôi sao chính
            throttle(() => {
                createStar(currentX, currentY, 'star');
            }, 100);

            // Tạo các tia lấp lánh
            for (let i = 0; i < 2; i++) {
                setTimeout(() => {
                    createStar(currentX, currentY, 'sparkle');
                }, i * 50);
            }

            // Tạo trail effect
            createStar(currentX, currentY, 'trail');

            lastX = currentX;
            lastY = currentY;
        }
    });

    // Check authentication before starting quiz
    window.startQuiz = function(quizId) {
        if (!currentUser) {
            alert('Please login to take the quiz');
            showModal(loginModal);
            return;
        }
        try {
            // Verify quiz exists before redirecting
            fetch(`/api/quizzes/${quizId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Quiz not found');
                    }
                    window.location.href = `/take-quiz.html?id=${quizId}`;
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Could not start the quiz. The quiz might have been deleted or is temporarily unavailable.');
                });
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred. Please try again later.');
        }
    };

    // Quiz result functions
    async function loadQuizResults(quizId) {
        if (!currentUser) return;
        
        try {
            const response = await fetch(`/api/results/user/${currentUser.id}/quiz/${quizId}`);
            if (!response.ok) throw new Error('Failed to load quiz results');
            
            const results = await response.json();
            const resultElement = document.querySelector(`.quiz-results[data-quiz-id="${quizId}"]`);
            
            if (results.length > 0) {
                // Get the best score
                const bestResult = results.reduce((best, current) => 
                    current.score > best.score ? current : best
                );
                
                // Create results display
                let resultsHtml = `
                    <div class="result-summary">
                        <div class="result-score">
                            Best Score: ${bestResult.score}/${bestResult.totalQuestions}
                        </div>
                        <div class="result-stats">
                            <div class="stat-item">
                                <div class="stat-label">Correct Answers</div>
                                <div class="stat-value">${bestResult.score}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Incorrect Answers</div>
                                <div class="stat-value">${bestResult.totalQuestions - bestResult.score}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Time Taken</div>
                                <div class="stat-value">${Math.floor(bestResult.timeTaken / 60)}m ${bestResult.timeTaken % 60}s</div>
                            </div>
                        </div>
                    </div>`;

                if (bestResult.questionResults) {
                    resultsHtml += `<div class="questions-review">`;
                    bestResult.questionResults.forEach((qResult, index) => {
                        const isCorrect = qResult.userAnswerIndex === qResult.correctAnswerIndex;
                        resultsHtml += `
                            <div class="question-review">
                                <div class="question-text">
                                    <span class="question-number">Question ${index + 1}</span>
                                    ${qResult.questionText}
                                </div>
                                <div class="options-list">
                                    ${qResult.options.map((option, optIndex) => {
                                        const classes = [];
                                        if (optIndex === qResult.correctAnswerIndex) {
                                            classes.push('correct');
                                        } else if (optIndex === qResult.userAnswerIndex) {
                                            classes.push('incorrect');
                                        }
                                        if (optIndex === qResult.userAnswerIndex) {
                                            classes.push('user-selected');
                                        }
                                        return `
                                            <div class="option-item ${classes.join(' ')}">
                                                ${option}
                                                <span class="answer-icon correct"><i class="fas fa-check"></i></span>
                                                <span class="answer-icon incorrect"><i class="fas fa-times"></i></span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    });
                    resultsHtml += '</div>';
                }
                
                resultElement.innerHTML = resultsHtml;
            } else {
                resultElement.innerHTML = 'Not attempted yet';
            }
        } catch (error) {
            console.error('Error loading quiz results:', error);
        }
    }

    async function saveQuizResult(quizId, score, totalQuestions) {
        if (!currentUser) return;
        
        try {
            const result = {
                userId: currentUser.id,
                quizId: quizId,
                score: score,
                totalQuestions: totalQuestions,
                dateCompleted: new Date().toISOString()
            };
            
            const response = await fetch('/api/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(result)
            });
            
            if (!response.ok) throw new Error('Failed to save quiz result');
            
            // Reload the results display
            loadQuizResults(quizId);
        } catch (error) {
            console.error('Error saving quiz result:', error);
        }
    }

    const quizList = document.getElementById('quiz-list');
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question');
    const createQuizBtn = document.getElementById('create-quiz');
    const quizTitleInput = document.getElementById('quiz-title');

    let questionCount = 0;

    function addQuestionField(data) {
        const questionId = questionCount++;
        const div = document.createElement('div');
        div.className = 'question-block';

        // Helper to create a single option input
        const createOptionInput = (optionData, isCorrect) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-row';
            optionDiv.innerHTML = `
                <button class="remove-option-btn" title="Remove this option">×</button>
                <input type="radio" name="correct_q_${questionId}" class="correct-radio" title="Mark as correct answer" ${isCorrect ? 'checked' : ''}>
                <input type="text" class="option-text" placeholder="Enter answer option" value="${optionData || ''}">
            `;
            return optionDiv;
        };

        div.innerHTML = `
            <div class="question-header">
                <h4>Question ${questionId + 1}</h4>
                <button class="remove-q" title="Remove this question"><i class="fas fa-trash"></i> Remove Question</button>
            </div>
            <div class="form-group">
                <label>Question Text</label>
                <input type="text" class="q-text" placeholder="Type your question here..." value="${data?.questionText || ''}" />
            </div>
            <div class="form-group">
                <label>Answer Options</label>
                <div class="options-container"></div>
                <button class="add-option-btn">+ Add Option</button>
            </div>
        `;

        const optionsContainer = div.querySelector('.options-container');
        const initialOptions = data?.options || ['', '', '', ''];
        initialOptions.forEach((opt, index) => {
            optionsContainer.appendChild(createOptionInput(opt, index === (data?.correctAnswerIndex ?? -1)));
        });

        // Event delegation for options
        optionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-option-btn')) {
                if (optionsContainer.children.length > 2) { // Must have at least 2 options
                    e.target.parentElement.remove();
                } else {
                    alert('A question must have at least two options.');
                }
            }
        });

        // Add option button
        div.querySelector('.add-option-btn').addEventListener('click', () => {
            optionsContainer.appendChild(createOptionInput('', false));
        });
        
        questionsContainer.appendChild(div);

        // Remove question button
        div.querySelector('.remove-q').addEventListener('click', () => {
            div.remove();
            // Re-number questions
            const questionBlocks = document.querySelectorAll('.question-block');
            questionBlocks.forEach((block, index) => {
                block.querySelector('h4').textContent = `Question ${index + 1}`;
                // Update radio button names
                block.querySelectorAll('.correct-radio').forEach(radio => {
                    radio.name = `correct_q_${index}`;
                });
            });
            questionCount = questionBlocks.length;
        });
    }

    addQuestionBtn.addEventListener('click', () => addQuestionField());

    createQuizBtn.addEventListener('click', () => {
        const title = quizTitleInput.value.trim();
        if (!title) return alert('Please provide a title');
        const questionBlocks = Array.from(document.querySelectorAll('.question-block'));
        
        if (!currentUser) {
            alert('Please login to create a quiz');
            return;
        }

        try {
            const questions = questionBlocks.map((b, questionIndex) => {
                const optionRows = Array.from(b.querySelectorAll('.option-row'));
                const options = optionRows.map(row => row.querySelector('.option-text').value.trim()).filter(Boolean);
                
                let correctIndex = -1;
                optionRows.forEach((row, index) => {
                    if (row.querySelector('.correct-radio').checked) {
                        correctIndex = index;
                    }
                });

                if (correctIndex === -1) {
                    throw new Error(`Question ${questionIndex + 1} is missing a correct answer.`);
                }
                if (options.length < 2) {
                    throw new Error(`Question ${questionIndex + 1} must have at least two options.`);
                }

                return {
                    questionText: b.querySelector('.q-text').value,
                    options: options,
                    correctAnswerIndex: correctIndex
                };
            });

            fetch('/api/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, questions })
            }).then(res => {
                if (!res.ok) throw new Error('Server responded with an error');
                return res.json();
            }).then(created => {
                  alert('Quiz created successfully!');
                  quizTitleInput.value = '';
                  questionsContainer.innerHTML = '';
                  questionCount = 0;
                  addQuestionField(); // Add a fresh field
                  loadQuizzes();
              })
              .catch(err => { 
                  console.error(err); 
                  alert('Failed to create quiz. Check all fields are filled correctly.'); 
              });
        } catch (e) {
            alert(e.message);
        }
    });

    function loadQuizzes() {
        quizList.innerHTML = '';
        fetch('/api/quizzes')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(quizzes => {
                if (!Array.isArray(quizzes)) quizzes = [];
                quizzes.forEach(quiz => {
                    const quizElement = document.createElement('div');
                    quizElement.className = 'quiz-item';
                    quizElement.innerHTML = `
                        <h3>${quiz.title}</h3>
                        <p>${(quiz.questions || []).length} questions</p>
                        <button class="start-btn">Bắt đầu</button>
                    `;
                    quizElement.querySelector('.start-btn').addEventListener('click', () => startQuiz(quiz.id));
                    quizList.appendChild(quizElement);
                });
            })
            .catch(error => {
                console.error('Error fetching quizzes:', error);
                quizList.innerHTML = '<p class="error">Unable to load quizzes. Is the server running?</p>';
            });
    }

    function showQuiz(quiz) {
        const w = window.open('', '_blank');
        const html = [`
            <html><head><title>${quiz.title}</title><link rel="stylesheet" href="/style.css"></head><body>
            <h2>${quiz.title}</h2>
            <ol>
        `];
        (quiz.questions || []).forEach(q => {
            html.push(`<li><strong>${q.questionText}</strong><br/>Options: ${q.options.join(', ')}<br/>Correct index: ${q.correctAnswerIndex}</li>`);
        });
        html.push('</ol></body></html>');
        w.document.write(html.join('\n'));
        w.document.close();
    }

    // initial state: add one question field
    addQuestionField();
    loadQuizzes();
});

function startQuiz(quizId) {
    // Chuyển hướng người dùng sang trang chơi game với ID của quiz
    window.location.href = `quiz.html?id=${quizId}`;
}