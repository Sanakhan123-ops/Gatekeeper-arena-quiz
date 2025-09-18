

const questionDisplay = document.getElementById('question-display');
const answersContainer = document.getElementById('answers-container');
const nextButton = document.getElementById('next-button');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const participantForm = document.getElementById('participant-form');
const participantNameInput = document.getElementById('name');
const participantEmailInput = document.getElementById('email');
const thankYouMessage = document.getElementById('thank-you-message');
const participantNameDisplay = document.getElementById('participant-name-display');

let currentQuestionIndex = 0;
let score = 0;
let timer;
const TIME_PER_QUESTION = 10; // seconds
let timeLeft = TIME_PER_QUESTION;

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    quizContainer.style.display = 'block';
    resultContainer.style.display = 'none';
    showQuestion();
}

function showQuestion() {
    resetState();
    const question = questions[currentQuestionIndex];
    questionDisplay.innerHTML = question.question;

    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerHTML = answer.text;
        button.classList.add('btn');
        answersContainer.appendChild(button);
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
    });
    startTimer();
}

function resetState() {
    clearInterval(timer);
    while (answersContainer.firstChild) {
        answersContainer.removeChild(answersContainer.firstChild);
    }
    nextButton.style.display = 'none';
}

function selectAnswer(e) {
    clearInterval(timer);
    const selectedButton = e.target;
    const isCorrect = selectedButton.dataset.correct === 'true';
    if (isCorrect) {
        score++;
    }
    Array.from(answersContainer.children).forEach(button => {
        if (button.dataset.correct === 'true') {
            button.classList.add('correct');
        } else {
            button.classList.add('incorrect');
        }
        button.disabled = true;
    });
    // nextButton.style.display = 'block'; // Remove this line

    if (isCorrect) {
        // Automatically advance to the next question if correct
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                showQuestion();
            } else {
                showResult();
            }
        }, 1000); // 1-second delay to show the correct answer
    } else {
        // If incorrect, show correct answer then advance
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                showQuestion();
            } else {
                showResult();
            }
        }, 2000); // 2-second delay to show the correct answer
    }
}

function startTimer() {
    timeLeft = TIME_PER_QUESTION;
    timeDisplay.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeUp();
        }
    }, 1000);
}

function handleTimeUp() {
    Array.from(answersContainer.children).forEach(button => {
        if (button.dataset.correct === 'true') {
            button.classList.add('correct');
        }
        button.disabled = true;
    });
    // nextButton.style.display = 'block'; // Remove this line
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResult();
        }
    }, 2000); // 2-second delay after time up
}

nextButton.addEventListener('click', () => {
    // This event listener will no longer be needed for progression
    // as progression is now handled automatically in selectAnswer and handleTimeUp.
    // We can keep it if we want the button to have another function, or remove it.
    // For now, I will comment out the core logic.
    // currentQuestionIndex++;
    // if (currentQuestionIndex < questions.length) {
    //     showQuestion();
    // } else {
    //     showResult();
    // }
});

function showResult() {
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    scoreDisplay.textContent = score;
}

participantForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = participantNameInput.value;
    const email = participantEmailInput.value;

    // Here you would send the data to your backend
    // console.log(`Participant Name: ${name}, Email: ${email}, Score: ${score}`);

    // In a real application, you'd make a fetch/axios call here.
    // Example:
    try {
        const response = await fetch('http://localhost:8080/api/participants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, score }),
        });
        if (response.ok) {
            thankYouMessage.style.display = 'block';
            participantNameDisplay.textContent = name;
            participantForm.reset();
            participantForm.style.display = 'none';
        } else {
            alert('Failed to submit participant data.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting data.');
    }


    // thankYouMessage.style.display = 'block';
    // participantNameDisplay.textContent = name;
    // participantForm.reset();
    // participantForm.style.display = 'none';
});

startQuiz();
