let display = document.getElementById('display');
let currentInput = '0';
let shouldResetDisplay = false;
let language = 'pa';
let availableVoices = [];

// Function to load available voices
function loadVoices() {
    availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length === 0) {
        window.speechSynthesis.onvoiceschanged = function () {
            availableVoices = window.speechSynthesis.getVoices();
        };
    }
}

// Initialize voice loading
loadVoices();

const translations = {
    'pa': {
        'user-name': 'پنجابی کیلکولیٹر · v2.3',
        'display': '0',
        'clear': 'صاف',
        'delete': 'مٹاؤ',
        'divide': '÷',
        'multiply': '×',
        'seven': '۷',
        'eight': '۸',
        'nine': '۹',
        'subtract': '−',
        'four': '۴',
        'five': '۵',
        'six': '۶',
        'add': '+',
        'one': '۱',
        'two': '۲',
        'three': '۳',
        'sqrt': '√',
        'zero': '۰',
        'decimal': '۔',
        'equals': '=',
    },
    'en': {
        'user-name': 'English Calculator · v2.3',
        'display': '0',
        'clear': 'AC',
        'delete': 'DEL',
        'divide': '/',
        'multiply': '*',
        'seven': '7',
        'eight': '8',
        'nine': '9',
        'subtract': '-',
        'four': '4',
        'five': '5',
        'six': '6',
        'add': '+',
        'one': '1',
        'two': '2',
        'three': '3',
        'sqrt': '√',
        'zero': '0',
        'decimal': '.',
        'equals': '=',
    },
};

const speechMap = {
    'pa': {
        '0': 'صفر',
        '1': 'ایک',
        '2': 'دو',
        '3': 'تین',
        '4': 'چار',
        '5': 'پانچ',
        '6': 'چھ',
        '7': 'سات',
        '8': 'آٹھ',
        '9': 'نو',
        '.': 'اعشاریہ',
        '+': 'جمع',
        '-': 'منفی',
        '*': 'ضرب',
        '/': 'تقسیم',
        '√': 'مربع جڑ',
        'delete': 'آخری حرف مٹا دیا گیا',
        'clear': 'ڈسپلے صاف ہو گئی',
        'language': 'زبان تبدیل ہو گئی',
        'equals': 'برابر'
    },
    'en': {
        '0': 'zero',
        '1': 'one',
        '2': 'two',
        '3': 'three',
        '4': 'four',
        '5': 'five',
        '6': 'six',
        '7': 'seven',
        '8': 'eight',
        '9': 'nine',
        '.': 'point',
        '+': 'plus',
        '-': 'minus',
        '*': 'multiply',
        '/': 'divide',
        '√': 'square root',
        'delete': 'last character deleted',
        'clear': 'display cleared',
        'language': 'language changed',
        'equals': 'equals'
    }
};

function updateDisplay() {
    display.textContent = currentInput;
}

function appendToDisplay(value) {
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }

    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else {
        currentInput += value;
    }

    updateDisplay();
    playSound();
    createButtonRipple(event.target);

    // Speak the pressed button
    if (speechMap[language] && speechMap[language][value]) {
        speak(speechMap[language][value]);
    }
}

function clearDisplay() {
    currentInput = '0';
    updateDisplay();
    speak(speechMap[language]['clear']);
    playSound();
    createButtonRipple(event.target);
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
    speak(speechMap[language]['delete']);
    playSound();
    createButtonRipple(event.target);
}

function calculate() {
    try {
        let expression = currentInput
            .replace(/×/g, '*')
            .replace(/÷/g, '/');

        // Handle square root
        if (expression.includes('√')) {
            const sqrtRegex = /√(\d+\.?\d*)/g;
            expression = expression.replace(sqrtRegex, 'Math.sqrt($1)');
        }

        let result = eval(expression);

        if (result === Infinity || result === -Infinity) {
            currentInput = 'غلطی';
            speak('غلطی: صفر سے تقسیم کا پتہ چلا');
        } else if (isNaN(result)) {
            currentInput = 'غلطی';
            speak('غلطی: غلط حساب کتاب کا تسلسل');
        } else {
            // Round to avoid floating point precision issues
            result = Math.round(result * 100000000) / 100000000;
            currentInput = result.toString();

            // Speak the result
            const resultText = language === 'pa'
                ? `نتیجہ ہے ${result}`
                : `The result is ${result}`;
            speak(resultText);
        }

        shouldResetDisplay = true;
        updateDisplay();

        document.querySelector('.calculator').classList.add('speaking-animation');
        setTimeout(() => {
            document.querySelector('.calculator').classList.remove('speaking-animation');
        }, 600);

    } catch (error) {
        currentInput = 'غلطی';
        speak('سسٹم کی خرابی کا پتہ چلا');
        shouldResetDisplay = true;
        updateDisplay();
    }

    playSound();
    createButtonRipple(event.target);
}

function createButtonRipple(button) {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.background = 'rgba(255, 0, 0, 0.6)';
    ripple.style.borderRadius = '50%';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function speak(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;5
        utterance.volume = 0.8;

        // Find Punjabi voice if available
        if (language === 'ur') {
            const punjabiVoice = availableVoices.find(voice =>
                voice.lang.startsWith('ur') ||
                voice.name.includes('Urdu')
            );

            if (punjabiVoice) {
                utterance.voice = punjabiVoice;
                utterance.lang = 'ur-PK';
            } else {
                // Fallback to English if Punjabi voice not found
                utterance.lang = 'en-US';
                console.warn('Punjabi voice not available. Using English.');
            }
        } else {
            utterance.lang = 'en-US';
        }

        speechSynthesis.speak(utterance);
    }
}

function playSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1200;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

function switchLanguage() {
    language = language === 'pa' ? 'en' : 'pa';
    document.getElementById('lang-switcher').textContent = language === 'pa' ? 'EN' : 'PA';
    const elements = document.querySelectorAll('[data-translate-key]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate-key');
        element.textContent = translations[language][key];
    });

    // Speak language change
    speak(speechMap[language]['language']);
}

// Add ripple animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% { 
            transform: translate(-50%, -50%) scale(0); 
            opacity: 1; 
        }
        100% { 
            transform: translate(-50%, -50%) scale(4); 
            opacity: 0; 
        }
    }
`;
document.head.appendChild(style);

// Keyboard support
document.addEventListener('keydown', function (event) {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        appendToDisplay(key);
    } else if (key === '.') {
        appendToDisplay('.');
    } else if (key === '+') {
        appendToDisplay('+');
    } else if (key === '-') {
        appendToDisplay('-');
    } else if (key === '*') {
        appendToDisplay('*');
    } else if (key === '/') {
        event.preventDefault();
        appendToDisplay('/');
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

// Welcome message
setTimeout(() => {
    speak('کوانٹم نیورل کیلکولیٹر سسٹم شروع ہو گیا ہے۔ وائس سنتھیسس نیورل نیٹ ورک فعال ہے۔ حساب کتاب کے لیے تیار ہے۔');
}, 5);

// Add periodic ambient sounds
setInterval(() => {
    if (Math.random() > 0.7) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 200 + Math.random() * 100;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    }
}, 5000);

// Add initialization effect
window.addEventListener('load', function () {
    const calc = document.querySelector('.calculator-container');
    calc.style.transform = 'rotateX(15deg) rotateY(15deg) translateZ(100px)';
    calc.style.opacity = '0';

    setTimeout(() => {
        calc.style.transition = 'transform 1.5s ease-out, opacity 1.5s ease-out';
        calc.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
        calc.style.opacity = '1';
    }, 500);
});