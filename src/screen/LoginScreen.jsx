import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import LottieView from 'lottie-react-native'; // Importing LottieView
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const clearToken = async () => {
      try {
        await AsyncStorage.removeItem('jwtToken');
      } catch (e) {
        console.error('Error clearing token:', e);
      }
    };

    clearToken();
  }, []);

  const handleLogin = async () => {
    if (name && password) {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.post('http://192.168.1.16:5161/api/auth/login', {
          Name: name,
          Password: password,
        });

        if (response.data.success) {
          const { userName, token, userId } = response.data;
          await AsyncStorage.setItem('userName', userName);
          await AsyncStorage.setItem('jwtToken', token);
          await AsyncStorage.setItem('userId', userId);
          navigation.navigate('LEVELSELECTION');
        } else {
          setError(response.data.message || 'Invalid credentials');
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please fill out all fields');
    }
  };

  return (
    <View style={styles.container}>
      {/* Lottie Animation */}
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../../assets/animations/login.json')} // Path to the Lottie file
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      <Text style={styles.headingText}>Login</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={30} color={colors.secondary} />
        <TextInput
          style={styles.textInput}
          placeholder="Enter your name"
          placeholderTextColor={colors.secondary}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={30} color={colors.secondary} />
        <TextInput
          style={styles.textInput}
          placeholder="Enter your password"
          placeholderTextColor={colors.secondary}
          secureTextEntry
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

      <TouchableOpacity
        style={styles.signupWrapper}
        onPress={() => navigation.navigate('SIGNUP')}
      >
        <Text style={styles.signupText}>Haven't got an account? Sign up</Text>
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
  animationContainer: {
    height: 350,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  headingText: {
    fontSize: 28,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
    textAlign: 'center',
    marginVertical: 30,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 10,
    height: 50,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: fonts.Regular,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  loginButtonWrapper: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginTop: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.SemiBold,
  },
  signupWrapper: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
  },
});

export default LoginScreen;
