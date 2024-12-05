import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GameScreen = ({ route, navigation }) => {
  const { level } = route.params;  // Receiving level from the previous screen
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);  // Default timer for easy level
  const [gameOver, setGameOver] = useState(false);
  const [questionImage, setQuestionImage] = useState('');
  const [answerOptions, setAnswerOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [paused, setPaused] = useState(false);  // State to track if the game is paused
  const [answerStatus, setAnswerStatus] = useState('');  // Initialize answerStatus state
  const [intervalId, setIntervalId] = useState(null);  // Store the interval ID for the timer

  // Fetching question data from the API
  const fetchQuestionData = async () => {
    if (gameOver) return;  // Don't fetch new question if game is over

    try {
      const response = await fetch('http://marcconrad.com/uob/banana/api.php');
      const data = await response.json();

      if (data.question && data.solution !== undefined) {
        setQuestionImage(data.question);  // Assuming question is the image URL
        setCorrectAnswer(data.solution); // Assuming solution is the correct answer
        const options = generateOptions(data.solution); // Generate options with random placement of the correct answer
        setAnswerOptions(options);
      } else {
        console.error("Invalid data format from API");
      }
    } catch (error) {
      console.error('Error fetching question data:', error);
    }
  };

  // Generate random options with one correct answer (ensure no duplicates)
  const generateOptions = (correct) => {
    let options = [correct];
    const numOptions = level === 'Easy' ? 4 : level === 'Medium' ? 6 : 7; // Set the number of options based on the level

    while (options.length < numOptions) {
      let randomNum = Math.floor(Math.random() * 10);
      if (!options.includes(randomNum)) {
        options.push(randomNum);
      }
    }
    return shuffleArray(options);  // Shuffle the options so the correct answer is not always in the same spot
  };

  // Shuffle array function to randomize the options
  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // Set game parameters based on level
  useEffect(() => {
    fetchQuestionData();

    if (level === 'Easy') {
      setTimer(60);
    } else if (level === 'Medium') {
      setTimer(50);
    } else if (level === 'Hard') {
      setTimer(30);
    }
  }, [level]);

  // Handle timer countdown
  useEffect(() => {
    if (gameOver || timer === 0 || paused) return; // Stop the timer if game is over, time runs out or game is paused

    const id = setInterval(() => {
      setTimer((prevTime) => prevTime - 1);
    }, 1000);
    setIntervalId(id); // Store the interval ID for clearing later
    return () => clearInterval(id); // Clean up the interval when component unmounts or timer state changes
  }, [timer, gameOver, paused]);

  // Game over handling
  const handleGameOver = () => {
    setGameOver(true);
    clearInterval(intervalId); // Ensure interval is cleared when game ends
    Alert.alert("Time's up!", `Game Over! Your Score: ${score}`);
    
    // Navigate to RESULTSCREEN after game over
    navigation.navigate('RESULTSCREEN', { score, level });
  };

  // Reload question if the timer runs out or user selects the correct answer
  useEffect(() => {
    if (gameOver || selectedAnswer === correctAnswer) {
      if (selectedAnswer === correctAnswer) {
        // Update score and fetch next question
        const points = level === 'Easy' ? 10 : level === 'Medium' ? 20 : 30;
        setScore((prevScore) => prevScore + points);  // Increase score based on level
        setAnswerStatus('Correct!');
        setTimeout(() => {
          fetchQuestionData();  // Fetch the next question after a delay
          setAnswerStatus('');  // Clear the answer status
          setSelectedAnswer('');  // Clear the selected answer
        }, 1000);  // Delay for a second to show the correct answer message
      } else {
        setAnswerStatus('Incorrect!');
        setSelectedAnswer('');
      }
    }
  }, [gameOver, selectedAnswer, correctAnswer]);

  // Handle answer selection and update score
  const handleAnswerSelection = (answer) => {
    if (gameOver) return;  // Don't allow answering after game over
    setSelectedAnswer(answer);
  };

  // Toggle pause/resume
  const togglePause = () => {
    setPaused(!paused);
    if (!paused) {
      clearInterval(intervalId); // Clear the interval when paused
    }
  };

  // Navigate to LevelSelection screen
  const navigateHome = () => {
    navigation.navigate('LEVELSELECTION');
  };

  // Stop timer and alert user when time runs out
  useEffect(() => {
    if (timer === 0) {
      handleGameOver();
    }
  }, [timer]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>BananaGame</Text>
      <Text style={styles.levelText}>Level: {level}</Text>
      <Text style={styles.timerText}>Time: {timer}s</Text>
      <Text style={styles.scoreText}>Score: {score}</Text>

      {questionImage && !gameOver ? (
        <Image
          source={{ uri: questionImage }}
          style={[styles.questionImage, paused && styles.blurredImage]}
          onError={() => console.error('Error loading image')}
        />
      ) : (
        <Text style={styles.loadingText}>{gameOver ? "Game Over" : "Loading image..."}</Text>
      )}

      <Text style={styles.instructionText}>Select the correct answer:</Text>

      <View style={styles.answerOptions}>
        <View style={styles.optionsGrid}>
          {answerOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionBox}
              onPress={() => handleAnswerSelection(option)}
              disabled={gameOver}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.answerStatus, { color: answerStatus === 'Correct!' ? 'green' : 'red' }]}>
        {answerStatus}
      </Text>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={navigateHome}>
          <Ionicons name="home" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={togglePause}>
          <Ionicons name={paused ? "play" : "pause"} size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffff66',  // Light background color
  },
  heading: {
    fontSize: 30,  // Larger heading for visibility
    fontWeight: 'bold',
    color: '#2e8b57',  // Greenish color
    marginBottom: 150,
    top: 10  // Push heading down
  },
  levelText: {
    position: 'absolute',  // Position on the left side
    left: 20,
    top: 80,  // Move down from the heading
    fontSize: 18,
    color: '#000',
    top: 130
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff0000',
    marginBottom: 10,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 20,
    color: '#000',  // Removed bold
    marginBottom: 10,
    position: 'absolute',
    right: 20,  // Position on the right side
    top: 130,  // Move down from the heading
  },
  questionImage: {
    width: 410,
    height: 230,
    marginBottom: 20,
    borderRadius: 10,
  },
  blurredImage: {
    opacity: 0.5,
  },
  instructionText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 20,
  },
  answerOptions: {
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionBox: {
    width: 60,  // Smaller options
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    borderColor: '#000',
    borderWidth: 1,
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  answerStatus: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // Spacing for home and resume buttons
    width: '100%',
    marginTop: 20,
  },
  footerButton: {
    backgroundColor: '#2e8b57',
    padding: 10,
    borderRadius: 100,  // Rounded corners for the buttons
    width: '15%',  // Adjust button width to fit
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    fontSize: 18,
    color: '#ffffff',
  },
});



export default GameScreen;
