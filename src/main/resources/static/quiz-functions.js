async function loadQuizzes() {
    try {
        const response = await fetch('/api/quizzes');
        const quizzes = await response.json();

        quizList.innerHTML = '';
        quizzes.forEach(quiz => {
            const quizElement = document.createElement('div');
            quizElement.className = 'quiz-item';
            quizElement.innerHTML = `
                <div class="quiz-info">
                    <h3>${quiz.title}</h3>
                    <p>${quiz.questions.length} questions</p>
                </div>
                <div class="quiz-actions">
                    <button class="action-btn start-quiz" data-quiz-id="${quiz._id}">
                        <i class="fas fa-play"></i> Start Quiz
                    </button>
                    ${currentUser && currentUser.role === 'admin' ? `
                        <button class="action-btn edit-quiz" onclick="editQuiz('${quiz._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-quiz" onclick="deleteQuiz('${quiz._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : currentUser && quiz.createdBy === currentUser.id ? `
                        <button class="action-btn delete-quiz" data-quiz-id="${quiz._id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : ''}
                </div>
                <div class="quiz-results" data-quiz-id="${quiz._id}"></div>
            `;

            // Add event listeners
            const startButton = quizElement.querySelector('.start-quiz');
            startButton.addEventListener('click', () => startQuiz(quiz._id));

            const deleteButton = quizElement.querySelector('.delete-quiz');
            if (deleteButton) {
                deleteButton.addEventListener('click', async () => {
                    if (confirm('Are you sure you want to delete this quiz?')) {
                        try {
                            const response = await fetch(`/api/quizzes/${quiz._id}`, {
                                method: 'DELETE'
                            });
                            
                            if (response.ok) {
                                quizElement.remove();
                            } else {
                                throw new Error('Failed to delete quiz');
                            }
                        } catch (error) {
                            alert('Error deleting quiz: ' + error.message);
                        }
                    }
                });
            }

            quizList.appendChild(quizElement);
            loadQuizResults(quiz._id);
        });
    } catch (error) {
        console.error('Error:', error);
        quizList.innerHTML = '<p class="error">Error loading quizzes</p>';
    }
}