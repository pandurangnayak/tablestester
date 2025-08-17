let gameState = {
    isRunning: false,
    selectedTables: [],
    currentProblem: null,
    score: 0,
    streak: 0,
    maxStreak: 0,
    timeLeft: 300, // 5 minutes = 300 seconds
    timer: null,
    wrongAnswers: [],
    totalQuestions: 0
};

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// High score management
function getHighScore() {
    return parseInt(localStorage.getItem('multiplicationHighScore') || '0');
}

function setHighScore(score) {
    const currentHigh = getHighScore();
    if (score > currentHigh) {
        localStorage.setItem('multiplicationHighScore', score.toString());
        return true; // New high score
    }
    return false;
}

function updateHighScoreDisplay() {
    const highScore = getHighScore();
    document.getElementById('headerHighScore').textContent = highScore;
    document.getElementById('highScore').textContent = highScore;
}

function playSound(frequency, duration, type = 'correct') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    } else if (type === 'streak') {
        // Special sound for streak bonuses
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.1); // G5
        oscillator.frequency.setValueAtTime(987.77, audioContext.currentTime + 0.2); // B5
        oscillator.frequency.setValueAtTime(1174.66, audioContext.currentTime + 0.3); // D6
    } else {
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
    }
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function getSelectedTables() {
    const checkboxes = document.querySelectorAll('.checkboxes input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

function generateProblem() {
    if (gameState.selectedTables.length === 0) return null;
    
    const leftNum = gameState.selectedTables[Math.floor(Math.random() * gameState.selectedTables.length)];
    const rightNum = Math.floor(Math.random() * 9) + 2; // 2-10
    
    return {
        left: leftNum,
        right: rightNum,
        answer: leftNum * rightNum
    };
}

function displayProblem() {
    gameState.currentProblem = generateProblem();
    if (gameState.currentProblem) {
        document.getElementById('problem').textContent = 
            `${gameState.currentProblem.left} × ${gameState.currentProblem.right}`;
    }
    
    const answerInput = document.getElementById('answerInput');
    const submitBtn = document.getElementById('submitBtn');
    
    answerInput.value = '';
    answerInput.disabled = false;
    submitBtn.disabled = false;
    answerInput.focus();
}

function updateTimer() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (gameState.timeLeft <= 0) {
        stopTest();
        return;
    }
    
    gameState.timeLeft--;
}

function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

function updateStreak() {
    document.getElementById('streak').textContent = gameState.streak;
    
    // Add pulsing animation for streaks > 3
    const streakElement = document.querySelector('.streak');
    if (gameState.streak >= 3) {
        streakElement.style.animation = 'pulse 1s infinite';
    } else {
        streakElement.style.animation = 'none';
    }
}

function calculateStreakBonus(streak) {
    if (streak >= 10) return 5;
    if (streak >= 7) return 3;
    if (streak >= 5) return 2;
    if (streak >= 3) return 1;
    return 0;
}

function showFeedback(isCorrect) {
    const feedback = document.getElementById('feedback');
    const answerInput = document.getElementById('answerInput');
    const submitBtn = document.getElementById('submitBtn');
    
    // Immediately clear input and disable further input
    answerInput.value = '';
    answerInput.disabled = true;
    submitBtn.disabled = true;
    
    feedback.className = 'feedback';
    gameState.totalQuestions++;
    
    if (isCorrect) {
        gameState.streak++;
        gameState.maxStreak = Math.max(gameState.maxStreak, gameState.streak);
        
        const streakBonus = calculateStreakBonus(gameState.streak);
        const totalPoints = 1 + streakBonus;
        gameState.score += totalPoints;
        
        if (streakBonus > 0) {
            feedback.textContent = `🎉 CORRECT! +${totalPoints} (Streak Bonus!) 🔥`;
            feedback.classList.add('streak-bonus');
            playSound(523.25, 0.4, 'streak');
        } else {
            feedback.textContent = '🎉 CORRECT! +1 🎉';
            feedback.classList.add('correct');
            playSound(523.25, 0.3, 'correct');
        }
    } else {
        gameState.streak = 0;
        
        // Track wrong answer only if this exact problem hasn't been recorded as wrong before
        const problemKey = `${gameState.currentProblem.left} × ${gameState.currentProblem.right}`;
        const userAnswer = parseInt(document.getElementById('answerInput').value) || 'No answer';
        
        const existingWrong = gameState.wrongAnswers.find(wrong => wrong.problem === problemKey);
        if (!existingWrong) {
            gameState.wrongAnswers.push({
                problem: problemKey,
                correctAnswer: gameState.currentProblem.answer,
                userAnswer: userAnswer
            });
        }
        
        feedback.textContent = `❌ WRONG ❌ (Answer: ${gameState.currentProblem.answer})`;
        feedback.classList.add('wrong');
        playSound(200, 0.5, 'wrong');
    }
    
    updateScore();
    updateStreak();
    
    setTimeout(() => {
        feedback.textContent = '';
        feedback.className = 'feedback';
        if (gameState.isRunning) {
            displayProblem();
            // Re-enable input for next question
            answerInput.disabled = false;
            submitBtn.disabled = false;
            answerInput.focus();
        }
    }, 800); // Reduced from 1500ms to 800ms for speed
}

function startTest() {
    gameState.selectedTables = getSelectedTables();
    
    if (gameState.selectedTables.length === 0) {
        alert('Please select at least one multiplication table!');
        return;
    }
    
    // Initialize audio context on user interaction
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.maxStreak = 0;
    gameState.timeLeft = 300; // 5 minutes
    gameState.wrongAnswers = [];
    gameState.totalQuestions = 0;
    
    document.querySelector('header').classList.add('hidden');
    document.getElementById('gameArea').classList.remove('hidden');
    document.getElementById('reviewScreen').classList.add('hidden');
    
    updateScore();
    updateStreak();
    updateHighScoreDisplay();
    displayProblem();
    
    gameState.timer = setInterval(updateTimer, 1000);
}

function showReviewScreen() {
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalStreak').textContent = gameState.maxStreak;
    document.getElementById('totalQuestions').textContent = gameState.totalQuestions;
    
    const wrongSection = document.getElementById('wrongAnswersSection');
    const wrongList = document.getElementById('wrongAnswersList');
    
    if (gameState.wrongAnswers.length > 0) {
        wrongSection.classList.remove('hidden');
        wrongList.innerHTML = gameState.wrongAnswers.map(wrong => 
            `<div class="wrong-answer-item">
                <div class="problem">${wrong.problem}</div>
                <div>Your answer: ${wrong.userAnswer}</div>
                <div class="answer">Correct: ${wrong.correctAnswer}</div>
            </div>`
        ).join('');
    } else {
        wrongSection.classList.add('hidden');
    }
    
    document.getElementById('gameArea').classList.add('hidden');
    document.getElementById('reviewScreen').classList.remove('hidden');
}

function stopTest() {
    gameState.isRunning = false;
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    const isNewHighScore = setHighScore(gameState.score);
    updateHighScoreDisplay();
    
    showReviewScreen();
}

function backToMenu() {
    document.querySelector('header').classList.remove('hidden');
    document.getElementById('reviewScreen').classList.add('hidden');
}

function submitAnswer() {
    const answerInput = document.getElementById('answerInput');
    const submitBtn = document.getElementById('submitBtn');
    
    // Prevent multiple submissions
    if (!gameState.isRunning || !gameState.currentProblem || answerInput.disabled) return;
    
    const userAnswer = parseInt(answerInput.value);
    const isCorrect = userAnswer === gameState.currentProblem.answer;
    
    showFeedback(isCorrect);
}

// Event listeners
document.getElementById('answerInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitAnswer();
    }
});

// Handle checkbox styling for browsers that don't support :has()
document.querySelectorAll('.checkboxes input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const label = this.parentElement;
        if (this.checked) {
            label.style.background = '#98FB98';
            label.style.borderColor = '#32CD32';
            label.style.color = '#006400';
        } else {
            label.style.background = '#FFE4E1';
            label.style.borderColor = '#FFB6C1';
            label.style.color = '#8B4513';
        }
    });
});

// Initialize high score display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateHighScoreDisplay();
});
