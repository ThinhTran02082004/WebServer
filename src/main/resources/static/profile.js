document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '/';
        return;
    }

    // Update profile info
    document.getElementById('username').textContent = currentUser.username;
    document.getElementById('email').textContent = currentUser.email;

    // Load user's quiz history
    loadQuizHistory();

    // Add filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadQuizHistory(btn.dataset.filter);
        });
    });
});

async function loadQuizHistory(filter = 'all') {
    const historyContainer = document.getElementById('quiz-history');

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = '/';
            return;
        }

        const response = await fetch(`/api/results/user/${currentUser.id}`);
        if (!response.ok) {
            throw new Error('Failed to load quiz history');
        }
        
        const results = await response.json();
        
        // Calculate statistics
        const totalQuizzes = results.length;
        const averageScore = results.length > 0 
            ? results.reduce((sum, r) => sum + (r.score / r.totalQuestions * 100), 0) / results.length 
            : 0;
        const bestScore = results.length > 0 
            ? Math.max(...results.map(r => (r.score / r.totalQuestions * 100)))
            : 0;

        // Update statistics
        document.getElementById('completed-quizzes').textContent = totalQuizzes;
        document.getElementById('average-score').textContent = `${averageScore.toFixed(1)}%`;
        document.getElementById('best-score').textContent = `${bestScore.toFixed(1)}%`;

        if (results.length === 0) {
            historyContainer.innerHTML = `
                <div class="no-quizzes">
                    <i class="fas fa-info-circle"></i>
                    <p>You haven't completed any quizzes yet.</p>
                </div>
            `;
            return;
        }

        // Get quiz details for each result
        const quizPromises = results.map(async result => {
            try {
                // If quizId is null, return it as a deleted quiz
                if (!result.quizId) {
                    return {
                        ...result,
                        quizTitle: result.quizTitle || 'Deleted Quiz',
                        quizDeleted: true
                    };
                }

                const quizResponse = await fetch(`/api/quizzes/${result.quizId}`);
                if (!quizResponse.ok) {
                    return {
                        ...result,
                        quizTitle: result.quizTitle || 'Deleted Quiz',
                        quizDeleted: true
                    };
                }
                const quiz = await quizResponse.json();
                return {
                    ...result,
                    quizTitle: quiz.title,
                    quizDeleted: false
                };
            } catch (error) {
                return {
                    ...result,
                    quizTitle: result.quizTitle || 'Deleted Quiz',
                    quizDeleted: true
                };
            }
        });

        const resultsWithQuizDetails = await Promise.all(quizPromises);
        
        // Filter results
        let filteredResults = resultsWithQuizDetails;
        if (filter === 'completed') {
            filteredResults = filteredResults.filter(r => r.score === r.totalQuestions);
        } else if (filter === 'best') {
            const maxScore = Math.max(...filteredResults.map(r => r.score / r.totalQuestions));
            filteredResults = filteredResults.filter(r => (r.score / r.totalQuestions) === maxScore);
        }

        // Display filtered results
        const historyContainer = document.getElementById('quiz-history-list');
        if (!historyContainer) {
            console.error('Quiz history container not found');
            return;
        }

        if (filteredResults.length === 0) {
            historyContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-filter"></i>
                    <p>No quizzes match the selected filter.</p>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = filteredResults.map(result => {
            const scorePercentage = ((result.score / result.totalQuestions) * 100).toFixed(1);
            const completionDate = new Date(result.dateCompleted).toLocaleDateString();
            
            return `
                <div class="quiz-history-item${result.quizDeleted ? ' quiz-deleted' : ''}">
                    <div class="quiz-info">
                        <h3>${result.quizTitle}</h3>
                        <p class="completion-date">${completionDate}</p>
                    </div>
                    <div class="quiz-score">
                        <p class="score">${scorePercentage}%</p>
                        <p class="questions">${result.score}/${result.totalQuestions} questions</p>
                    </div>
                    ${result.quizDeleted ? `
                        <div class="quiz-deleted-notice">
                            <i class="fas fa-exclamation-circle"></i> Quiz no longer available
                        </div>
                    ` : `
                        <div class="quiz-actions">
                            <a href="quiz.html?id=${result.quizId}" class="review-btn">
                                <i class="fas fa-eye"></i> Review
                            </a>
                        </div>
                    `}
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading quiz history:', error);
        const historyContainer = document.getElementById('quiz-history-list');
        if (historyContainer) {
            historyContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load quiz history. Please try again later.</p>
                </div>
            `;
        }
    }
}