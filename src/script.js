  document.addEventListener('DOMContentLoaded', async function() {
    let score = 0;
    let total = 0;
    let currentElement = {};
    let characterData = [];
    let firstGuess = false;


    // Fetch the JSON data
    try {
      const response = await fetch('./assets/data/character-data.json');
      characterData = await response.json();
    } catch (error) {
      console.error('Error loading character data:', error);
      return;
    }

    function disableOptionButtons() {
      document.querySelectorAll('.element-btn').forEach(button => {
        button.disabled = true;
      });
    }

    function enableOptionButtons() {
      document.querySelectorAll('.element-btn').forEach(button => {
        button.disabled = false;
      });
      firstGuess = false; 
    }

    function loadNewImage() {
      // Use characterData instead of the hardcoded data array
      currentElement = characterData[Math.floor(Math.random() * characterData.length)];
      console.log(currentElement);

      // Update the image source to use local path
      // Assuming your character images are stored in a folder like 'assets/characters/'
      currentElement.name = currentElement.name.replace(' ', '_'); 
      document.getElementById('element-image').src = `assets/character-icons/${currentElement.name}.png`;

      document.getElementById('game-text').style.display = 'block'; 
      document.getElementById('result').textContent = '';
      document.getElementById('result').style.display = 'none';

      enableOptionButtons();
    }

    function checkAnswer(selectedElement) {
      if (!firstGuess) {
        document.getElementById('game-text').style.display = 'none'; // Hide the original text
        document.getElementById('result').style.display = 'block'; // Show result text
        firstGuess = true;
      }

      // Remove any whitespace and compare the selected element with current element
      const cleanedSelection = selectedElement.trim();
      if (cleanedSelection === currentElement.element) {
        document.getElementById('result').textContent = 'Correct!';
        document.getElementById('result').style.color = '#2ecc71';
        score++;
        total++;
      } else {
        document.getElementById('result').textContent = `Wrong! The correct answer was ${currentElement.element}`;
        document.getElementById('result').style.color = '#e74c3c';
        total++;
      }
      document.getElementById('score').textContent = score;
      document.getElementById('total').textContent = total;
      disableOptionButtons();
    }

    document.querySelectorAll('.element-btn').forEach(button => {
      button.addEventListener('click', function() {
        // Extract just the element name from the button text
        const elementText = this.textContent.trim();
        checkAnswer(elementText);
      });
    });

    document.getElementById('new-image-btn').addEventListener('click', loadNewImage);

    // Initial load of an image
    loadNewImage();
  });
