document.addEventListener('DOMContentLoaded', function() {
    const elements = [
        { src: '/api/placeholder/300/200?text=Pyro', answer: 'Pyro' },
        { src: '/api/placeholder/300/200?text=Hydro', answer: 'Hydro' },
        { src: '/api/placeholder/300/200?text=Electro', answer: 'Electro' },
        { src: '/api/placeholder/300/200?text=Cryo', answer: 'Cryo' },
        { src: '/api/placeholder/300/200?text=Anemo', answer: 'Anemo' },
        { src: '/api/placeholder/300/200?text=Geo', answer: 'Geo' },
        { src: '/api/placeholder/300/200?text=Dendro', answer: 'Dendro' }
    ];

    let score = 0;
    let currentElement = {};

    function disableOptionButtons() {
        document.querySelectorAll('.element-btn').forEach(button => {
            button.disabled = true;
        });
    }

    function enableOptionButtons() {
        document.querySelectorAll('.element-btn').forEach(button => {
            button.disabled = false;
        });
    }

    function loadNewImage() {
        currentElement = elements[Math.floor(Math.random() * elements.length)];
        document.getElementById('element-image').src = currentElement.src;
        document.getElementById('result').textContent = '';
        enableOptionButtons();
    }

    function checkAnswer(answer) {
        if (answer === currentElement.answer) {
            document.getElementById('result').textContent = 'Correct!';
            document.getElementById('result').style.color = '#2ecc71';
            score++;
        } else {
            document.getElementById('result').textContent = `Wrong! The correct answer was ${currentElement.answer}`;
            document.getElementById('result').style.color = '#e74c3c';
        }
        document.getElementById('score').textContent = score;
        disableOptionButtons();
    }

    document.querySelectorAll('.element-btn').forEach(button => {
        button.addEventListener('click', function() {
            checkAnswer(this.textContent);
        });
    });

    document.getElementById('new-image-btn').addEventListener('click', loadNewImage);

    loadNewImage();
});
