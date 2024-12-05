import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ResultScreen = ({ route, navigation }) => {
  const { score, level } = route.params;
  const [userName, setUserName] = useState('');
  const [token, setToken] = useState('');
  const [highestScore, setHighestScore] = useState(null);

  // Fetch username and token from AsyncStorage
  useEffect(() => {
    const getUserNameAndToken = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        const storedToken = await AsyncStorage.getItem('jwtToken');
        setUserName(storedUserName || 'Guest');
        setToken(storedToken || ''); // Token for authentication
      } catch (error) {
        alert('Failed to load data: ' + error);
        setUserName('Guest');
        setToken('');
      }
    };

    getUserNameAndToken();
  }, []);

  // Fetch the highest score for the user or submit if no record is found
  useEffect(() => {
    const fetchHighestScore = async () => {
      try {
        const response = await axios.get('http://192.168.1.16:5161/api/game/get-highest-score', {
          headers: {
            Authorization: `Bearer ${token}`, // Token for authentication
          },
        });
        setHighestScore(response.data.highestScore ?? 0); // Set score to 0 if no record exists
      } catch (error) {
        if (error.response && error.response.status === 404) {
          submitScore(); // If no score found, submit the new score
        } else {
          console.log("Error fetching highest score:", error.message);
          alert('Error fetching highest score: ' + error.message);
        }
      }
    };

    if (userName && token) {
      fetchHighestScore();
    }
  }, [userName, token]);

  // Submit score in the required format
  const submitScore = async () => {
    const formatDate = (date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Add leading zero if needed
      const day = String(date.getUTCDate()).padStart(2, '0'); // Add leading zero if needed
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`; // Format as "YYYY-MM-DDTHH:mm:ssZ"
    };

    const currentDate = formatDate(new Date()); // Format current date in the required format

    const scoreData = {
      username: userName, // Username
      points: score,      // Score points
      date: currentDate,  // Formatted date
    };

    try {
      const response = await axios.post('http://192.168.1.16:5161/api/game/submit-score', scoreData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // Ensure the correct Content-Type
        },
      });
      console.log("Score submitted successfully:", response.data);

      alert('Score submitted successfully.');
      setHighestScore(score); // Update the local highest score
    } catch (error) {
      console.error('Error submitting score:', error);
      if (error.response) {
        alert('Error submitting score: ' + (error.response.data.message || error.response.statusText));
      } else {
        alert('Error submitting score: ' + error.message);
      }
    }
  };

  // Generate motivational slogan based on the level
  const getMotivationalSlogan = (level) => {
    switch (level) {
      case 'Easy':
        return 'Great start, keep going!';
      case 'Medium':
        return 'Well done, you are improving!';
      case 'Hard':
        return 'Amazing effort, challenge accepted!';
      default:
        return 'Good job, keep up the great work!';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>BananaGame</Text>
      <Text style={styles.subHeading}>Your Result</Text>

      <View style={styles.resultCard}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.usernameText}>Username: {userName}</Text>
        <Text style={styles.levelText}>Level: {level}</Text>
        <Text style={styles.motivationalText}>{getMotivationalSlogan(level)}</Text>
      </View>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('LEVELSELECTION')}
      >
        <Ionicons name="home" size={30} color="#fff" />
        <Text style={styles.buttonText}>Back to Level Selection</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.leaderboardButton}
        onPress={() => navigation.navigate('BOARDSCREEN')}
      >
        <Ionicons name="trophy" size={30} color="#fff" />
        <Text style={styles.buttonText}>View Leaderboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    padding: 20,
  },
  heading: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2e8b57',
    marginBottom: 30,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 26,
    color: '#333',
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: '80%',
    marginBottom: 40,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  usernameText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  levelText: {
    fontSize: 20,
    color: '#FF6347',
    marginBottom: 20,
    textAlign: 'center',
  },
  motivationalText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#4CAF50',
    marginBottom: 30,
    textAlign: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 50,
    elevation: 5,
    marginBottom: 10,
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700', // Gold color for leaderboard button
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 50,
    elevation: 5,
    marginBottom: 10,
  },
  buttonText: {
    marginLeft: 15,
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

export default ResultScreen;
