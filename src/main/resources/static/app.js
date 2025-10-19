document.addEventListener('DOMContentLoaded', () => {
    // Auth state
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Auth elements
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const profileBtn = document.getElementById('profileBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    
    // Profile button click handler
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            window.location.href = '/profile.html';
        });
    }
    
    // Update auth display after elements are initialized
    updateAuthDisplay();
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
    
    // Close modal when clicking close button or outside modal
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = button.closest('.modal');
            if (modal) {
                hideModal(modal);
            }
        });
    });

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
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
    // Function to update auth display
    function updateAuthDisplay() {
        // Re-fetch elements to ensure they exist
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        const usernameSpan = document.getElementById('username');

        if (currentUser) {
            // Hide auth buttons
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            // Show user info
            if (userInfo) userInfo.style.display = 'flex';
            if (usernameSpan) usernameSpan.textContent = currentUser.username;
        } else {
            // Show auth buttons
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
            // Hide user info
            if (userInfo) userInfo.style.display = 'none';
            if (usernameSpan) usernameSpan.textContent = '';
        }
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('currentUser');
            currentUser = null;
            updateAuthDisplay();
            location.reload();
        }
    });

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
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userInfo = document.querySelector('.user-info');
        const adminActions = document.querySelectorAll('.admin-only');
        const quizSection = document.querySelector('.quiz-section');

        if (currentUser) {
            // Hide login/register buttons and show logout
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';

            // Show/hide admin actions based on role
            if (adminActions && adminActions.length > 0) {
                adminActions.forEach(action => {
                    action.style.display = currentUser.role === 'admin' ? 'block' : 'none';
                });
            }

            // Thêm class user-mode cho quiz-section khi không phải Admin
            if (quizSection) {
                if (currentUser.role !== 'admin') {
                    quizSection.classList.add('user-mode');
                } else {
                    quizSection.classList.remove('user-mode');
                }
            }
        } else {
            // Show login/register buttons and hide logout
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
            if (userInfo) userInfo.style.display = 'none';
            
            // Hide all admin actions
            if (adminActions && adminActions.length > 0) {
                adminActions.forEach(action => action.style.display = 'none');
            }

            // Thêm class user-mode khi chưa đăng nhập (giống User)
            if (quizSection) {
                quizSection.classList.add('user-mode');
            }
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

    // Admin functions for managing quizzes
    let editQuizModal = document.getElementById('editQuizModal');
    let currentEditingQuiz = null;

    function showEditQuizModal(quiz) {
        currentEditingQuiz = quiz;
        document.getElementById('edit-quiz-title').value = quiz.title;
        
        const questionsContainer = document.getElementById('edit-questions-container');
        questionsContainer.innerHTML = '';
        
        quiz.questions.forEach((question, index) => {
            const questionDiv = createQuestionEditElement(question, index);
            questionsContainer.appendChild(questionDiv);
        });
        
        editQuizModal.style.display = 'block';
    }

    function createQuestionEditElement(question, index) {
        const div = document.createElement('div');
        div.className = 'question-item';
        div.innerHTML = `
            <textarea class="question-text" required>${question.text}</textarea>
            <div class="options-list">
                ${question.options.map((option, optIndex) => `
                    <div class="option-item">
                        <input type="radio" name="correct-${index}" ${option === question.correctAnswer ? 'checked' : ''}>
                        <input type="text" value="${option}" required>
                        <button type="button" class="remove-btn" onclick="removeOption(this)">×</button>
                    </div>
                `).join('')}
            </div>
            <button type="button" class="add-option-btn" onclick="addOption(this)">Add Option</button>
            <button type="button" class="remove-btn" onclick="removeQuestion(this)">Remove Question</button>
        `;
        return div;
    }

    window.closeEditQuizModal = function() {
        editQuizModal.style.display = 'none';
        currentEditingQuiz = null;
    }

    window.addQuestionToEdit = function() {
        const container = document.getElementById('edit-questions-container');
        const newQuestion = {
            text: '',
            options: ['', ''],
            correctAnswer: ''
        };
        const questionDiv = createQuestionEditElement(newQuestion, container.children.length);
        container.appendChild(questionDiv);
    }

    window.addOption = function(btn) {
        const optionsList = btn.previousElementSibling;
        const questionIndex = Array.from(btn.closest('.question-item').parentNode.children).indexOf(btn.closest('.question-item'));
        const newOption = document.createElement('div');
        newOption.className = 'option-item';
        newOption.innerHTML = `
            <input type="radio" name="correct-${questionIndex}">
            <input type="text" value="" required>
            <button type="button" class="remove-btn" onclick="removeOption(this)">×</button>
        `;
        optionsList.appendChild(newOption);
    }

    window.removeOption = function(btn) {
        const optionItem = btn.closest('.option-item');
        const optionsList = optionItem.parentNode;
        if (optionsList.children.length > 2) {
            optionItem.remove();
        } else {
            alert('Each question must have at least 2 options');
        }
    }

    window.removeQuestion = function(btn) {
        const questionItem = btn.closest('.question-item');
        const container = questionItem.parentNode;
        if (container.children.length > 1) {
            questionItem.remove();
        } else {
            alert('Quiz must have at least one question');
        }
    }

    document.getElementById('editQuizForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!currentUser || currentUser.role !== 'admin' || !currentEditingQuiz) return;

        try {
            const updatedQuiz = {
                id: currentEditingQuiz.id,
                title: document.getElementById('edit-quiz-title').value,
                questions: Array.from(document.getElementById('edit-questions-container').children).map(questionDiv => {
                    const options = Array.from(questionDiv.querySelectorAll('.option-item input[type="text"]'))
                        .map(input => input.value.trim())
                        .filter(option => option !== '');
                    
                    const correctAnswerIndex = Array.from(questionDiv.querySelectorAll('.option-item input[type="radio"]'))
                        .findIndex(radio => radio.checked);
                    
                    return {
                        text: questionDiv.querySelector('.question-text').value.trim(),
                        options: options,
                        correctAnswer: options[correctAnswerIndex] || options[0]
                    };
                })
            };

            const response = await fetch(`/api/quizzes/${currentEditingQuiz.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Role': currentUser.role
                },
                body: JSON.stringify(updatedQuiz)
            });

            if (!response.ok) throw new Error('Failed to update quiz');
            
            alert('Quiz updated successfully');
            closeEditQuizModal();
            loadQuizzes(); // Refresh quiz list
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update quiz');
        }
    });

    // Close modal when clicking outside
    editQuizModal.addEventListener('click', function(e) {
        if (e.target === editQuizModal) {
            closeEditQuizModal();
        }
    });

    // Close modal when clicking the close button
    document.querySelector('#editQuizModal .close-btn').addEventListener('click', closeEditQuizModal);

    window.editQuiz = async function(quizId) {
        if (!currentUser || currentUser.role !== 'admin') {
            alert('Only administrators can edit quizzes');
            return;
        }

        try {
            const response = await fetch(`/api/quizzes/${quizId}`, {
                headers: {
                    'User-Role': currentUser.role
                }
            });
            if (!response.ok) throw new Error('Failed to load quiz');
            
            const quiz = await response.json();
            showEditQuizModal(quiz);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load quiz for editing');
        }
    };

    window.deleteQuiz = async function(quizId) {
        if (!currentUser || currentUser.role !== 'admin') {
            alert('Only administrators can delete quizzes');
            return;
        }

        if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/quizzes/${quizId}`, {
                method: 'DELETE',
                headers: {
                    'User-Role': currentUser.role
                }
            });

            if (!response.ok) throw new Error('Failed to delete quiz');
            alert('Quiz deleted successfully');
            loadQuizzes(); // Refresh quiz list
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete quiz');
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

    createQuizBtn.addEventListener('click', async () => {
        const title = quizTitleInput.value.trim();
        if (!title) return alert('Please provide a title');
        const questionBlocks = Array.from(document.querySelectorAll('.question-block'));
        
        if (!currentUser) {
            alert('Please login to create a quiz');
            return;
        }
        
        if (currentUser.role !== 'admin') {
            alert('Only administrators can create quizzes');
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

            // Add createdBy field
            const quizData = {
                title,
                questions,
                createdBy: currentUser.id
            };

            // Create the quiz
            const response = await fetch('/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quizData)
            });

            if (!response.ok) {
                throw new Error('Failed to create quiz');
            }

            // Clear form and reload quizzes
            quizTitleInput.value = '';
            questionsContainer.innerHTML = '';
            questionCount = 0;
            loadQuizzes(); // Reload the quiz list

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
                    
                    // Tạo phần HTML cho quiz item với icon và thông tin chi tiết hơn
                    let quizHTML = `
                        <h3><i class="fas fa-book-open"></i> ${quiz.title}</h3>
                        <p><i class="fas fa-tasks"></i> ${(quiz.questions || []).length} câu hỏi</p>
                        <div class="quiz-actions">
                            <button class="start-btn">
                                <i class="fas fa-play"></i> Bắt đầu
                            </button>
                    `;
                    
                    // Thêm nút xóa nếu người dùng là admin
                    if (currentUser && currentUser.role === 'admin') {
                        quizHTML += `
                            <button class="delete-btn" title="Delete Quiz">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        `;
                    }
                    
                    quizHTML += `</div>`;
                    quizElement.innerHTML = quizHTML;
                    
                    // Thêm event listener cho nút bắt đầu
                    quizElement.querySelector('.start-btn').addEventListener('click', () => startQuiz(quiz.id));
                    
                    // Thêm event listener cho nút xóa nếu nó tồn tại
                    const deleteBtn = quizElement.querySelector('.delete-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', () => deleteQuiz(quiz.id));
                    }
                    
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