document.addEventListener('DOMContentLoaded', () => {
    const quizTitle = document.getElementById('quiz-title');
    const quizContainer = document.getElementById('quiz-container');
    const submitQuizBtn = document.getElementById('submit-quiz');
    const resultsContainer = document.getElementById('results-container');

    const params = new URLSearchParams(window.location.search);
    const quizId = params.get('id');

    if (!quizId) {
        quizContainer.innerHTML = '<p class="error">Không tìm thấy ID của quiz.</p>';
        return;
    }

    fetch(`/api/quizzes/${quizId}`)
        .then(response => {
            if (!response.ok) throw new Error('Không thể tải quiz');
            return response.json();
        })
        .then(quiz => {
            quizTitle.textContent = quiz.title;
            quiz.questions.forEach((q, index) => {
                const questionElement = document.createElement('div');
                questionElement.className = 'question';
                let optionsHtml = q.options.map((option, i) => `
                    <label>
                        <input type="radio" name="question_${index}" value="${i}">
                        ${option}
                    </label>
                `).join('<br>');

                questionElement.innerHTML = `
                    <p><strong>Câu ${index + 1}:</strong> ${q.questionText}</p>
                    ${optionsHtml}
                `;
                quizContainer.appendChild(questionElement);
            });

            submitQuizBtn.addEventListener('click', () => {
                let score = 0;
                quiz.questions.forEach((q, index) => {
                    const selected = document.querySelector(`input[name="question_${index}"]:checked`);
                    if (selected && parseInt(selected.value) === q.correctAnswerIndex) {
                        score++;
                    }
                });
                showResults(score, quiz.questions.length);
            });
        })
        .catch(error => {
            console.error('Lỗi tải quiz:', error);
            quizContainer.innerHTML = '<p class="error">Không thể tải chi tiết quiz. Vui lòng thử lại.</p>';
        });

    function showResults(score, total) {
        quizContainer.style.display = 'none';
        submitQuizBtn.style.display = 'none';
        resultsContainer.innerHTML = `
            <h2>Kết quả</h2>
            <p>Bạn đã trả lời đúng ${score} / ${total} câu hỏi.</p>
        `;
    }
});
