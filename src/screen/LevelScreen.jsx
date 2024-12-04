import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  
import { useNavigation } from '@react-navigation/native';
import { colors } from '../utils/colors'; 
import { fonts } from '../utils/fonts'; 

const LevelScreen = () => {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const levels = [
    { id: 1, name: 'Easy', description: '4 options, 1-minute timer' },
    { id: 2, name: 'Medium', description: '6 options, 50-second timer' },
    { id: 3, name: 'Hard', description: '7 options, 2-minute timer' },
  ];

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        if (storedUserName) {
          setUserName(storedUserName); 
        } else {
          setUserName('Guest'); 
        }
        await AsyncStorage.setItem('userName', storedUserName || 'Guest'); // Save it to AsyncStorage
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUserName('Guest');  
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  const handleLevelSelect = (level) => {
    console.log('Selected Level:', level.name);
    navigation.navigate('GAME', { level: level.name }); 
  };

  const handleEditProfile = () => {
    navigation.navigate('PROFILESCREEN'); // Navigate to the Profile screen
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
          <Text style={styles.instructionsText}>Please select a level to play:</Text>
          <View style={styles.levelsContainer}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={styles.levelButton}
                onPress={() => handleLevelSelect(level)}
              >
                <Text style={styles.levelText}>{level.name}</Text>
                <Text style={styles.levelDescription}>{level.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272757',  // Background color: Dark Blue (#272757)
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 32,
    color: '#8686AC',  // Text color: Light Purple (#8686AC)
    fontFamily: fonts.SemiBold,
  },
  instructionsText: {
    fontSize: 18,
    color: '#505081',  // Instructions color: Medium Purple (#505081)
    marginTop: 20,
    fontFamily: fonts.Regular,
  },
  levelsContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  levelButton: {
    backgroundColor: '#0F0E47',  // Button color: Dark Purple (#0F0E47)
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 22,
    color: '#FFFFFF',  // Text color: White
    fontFamily: fonts.SemiBold,
  },
  levelDescription: {
    fontSize: 16,
    color: '#FFFFFF',  // Description color: White
    marginTop: 5,
    fontFamily: fonts.Regular,
  },
  editProfileButton: {
    marginTop: 30,
    backgroundColor: '#505081',  // Button color: Medium Purple (#505081)
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 18,
    color: '#FFFFFF',  // Text color: White
    fontFamily: fonts.SemiBold,
  },
});

export default LevelScreen;
