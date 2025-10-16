function showIncorrectAnswers() {
    const incorrectAnswersContainer = document.getElementById('incorrect-answers-review');
    
    // Get incorrect answers
    const incorrectQuestions = currentQuiz.questions.reduce((acc, question, index) => {
        if (answers[index] !== question.correctAnswerIndex) {
            acc.push({ question, userAnswer: answers[index] });
        }
        return acc;
    }, []);

    if (incorrectQuestions.length === 0) {
        incorrectAnswersContainer.innerHTML = `
            <div class="perfect-score">
                <i class="fas fa-trophy"></i>
                <p>Perfect Score! You got all questions correct!</p>
            </div>
        `;
    } else {
        incorrectAnswersContainer.innerHTML = `
            <h3>Incorrect Answers Review</h3>
            ${incorrectQuestions.map((item, index) => `
                <div class="question-review">
                    <div class="question-text">
                        <span class="question-number">Question ${index + 1}</span>
                        ${item.question.questionText}
                    </div>
                    <div class="options-list">
                        ${item.question.options.map((option, optIndex) => `
                            <div class="option-item ${optIndex === item.question.correctAnswerIndex ? 'correct' : ''} 
                                                    ${optIndex === item.userAnswer ? 'incorrect user-selected' : ''}">
                                ${option}
                                <span class="answer-icon correct"><i class="fas fa-check"></i></span>
                                <span class="answer-icon incorrect"><i class="fas fa-times"></i></span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    }

    // Toggle visibility
    const isVisible = incorrectAnswersContainer.style.display === 'block';
    incorrectAnswersContainer.style.display = isVisible ? 'none' : 'block';
    
    // Update button text
    const button = document.querySelector('button[onclick="showIncorrectAnswers()"]');
    button.textContent = isVisible ? 'View Incorrect Answers' : 'Hide Incorrect Answers';
    button.classList.toggle('active');
}