import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage for token storage

const LoginScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Clear any stored token on app load (optional: to force re-login on reload)
  useEffect(() => {
    const clearToken = async () => {
      try {
        await AsyncStorage.removeItem('jwtToken'); // Clear JWT token
        console.log('JWT Token cleared from AsyncStorage');
      } catch (e) {
        console.error('Error clearing token:', e);
      }
    };

    clearToken();
  }, []);

  // Fetch and log token and userId after successful login
  const fetchTokenAndUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const userId = await AsyncStorage.getItem('userId');
      if (token && userId) {
        console.log('Fetched token from AsyncStorage:', token);
        console.log('Fetched userId from AsyncStorage:', userId);
      } else {
        console.error('No token or userId found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error fetching token or userId:', error);
    }
  };

  // Handle Login
  const handleLogin = async () => {
    if (name && password) {
      setIsLoading(true); // Start loading state
      setError(''); // Clear previous errors
      try {
        // Make a POST request to validate the login credentials
        const response = await axios.post('http://192.168.43.54:5161/api/auth/login', {
          Name: name,        // Ensure "Name" matches the backend model
          Password: password // Ensure "Password" matches the backend model
        });
  
        console.log('Login response:', response.data); // Log full response for debugging
  
        if (response.data.success) {
          const { userName, token, userId } = response.data; // Destructure response data
  
          // Save the username, userId, and JWT token to AsyncStorage
          await AsyncStorage.setItem('userName', userName); // Store username
          await AsyncStorage.setItem('jwtToken', token);    // Store JWT token
          await AsyncStorage.setItem('userId', userId);     // Store userId
          console.log('Token and UserId saved to AsyncStorage:', token, userId);
  
          // Fetch and log token and userId immediately after saving them
          await fetchTokenAndUserId();
  
          // Navigate to the next screen after login
          navigation.navigate('LEVELSELECTION');
        } else {
          // Show error message if credentials are incorrect
          setError(response.data.message || 'Invalid credentials');
        }
      } catch (error) {
        console.error('Login error details:', error.response?.data || error.message); // Detailed error logging
        setError('An error occurred. Please try again.'); // Display generic error message
      } finally {
        setIsLoading(false); // Stop loading state
      }
    } else {
      setError('Please fill out all fields'); // Ensure both fields are filled
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.headingText}>Login</Text>

      <View style={styles.inputContainer}>
        <Ionicons name={"person-outline"} size={30} color={colors.secondary} />
        <TextInput
          style={styles.textInput}
          placeholder="Enter your name"
          placeholderTextColor={colors.secondary}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name={"lock-closed-outline"} size={30} color={colors.secondary} />
        <TextInput
          style={styles.textInput}
          placeholder="Enter your password"
          placeholderTextColor={colors.secondary}
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity 
        style={styles.loginButtonWrapper} 
        onPress={handleLogin} 
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.loginText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  headingText: {
    fontSize: 32,
    color: colors.primary,
    fontFamily: 'Poppins-SemiBold', // Custom font
    textAlign: 'center',
    marginVertical: 40,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 100,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    marginVertical: 10,
    paddingVertical: 12, // Increase inner height
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: fonts.Light,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  loginButtonWrapper: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    marginTop: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.SemiBold,
    textAlign: 'center',
  },
});

export default LoginScreen;
