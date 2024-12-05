import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwtToken');
        const storedUserName = await AsyncStorage.getItem('userName');
        const storedUserId = await AsyncStorage.getItem('userId');

        setToken(storedToken || null);
        setUserName(storedUserName || null);
        setUserId(storedUserId || null);
      } catch (error) {
        setErrorMessage('Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!userId) return;

    const updatedData = {
      name: userName,
      email,
      password,
      phoneNumber,
    };

    try {
      const response = await fetch(`http://192.168.1.16:5161/api/Auth/User/${userId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      Alert.alert('Success', `Profile successfully updated. Message: ${result.Message}`);
    } catch (error) {
      setErrorMessage(error.message || 'Error updating profile');
    }
  };

  const handleDeleteProfile = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://192.168.1.16:5161/api/Auth/User/${userId}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }

      const result = await response.json();
      Alert.alert('Success', `Profile successfully deleted. Message: ${result.Message}`);
    } catch (error) {
      setErrorMessage(error.message || 'Error deleting profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {token && userName && userId ? (
        <>
          <Text style={styles.headerText}>Welcome, {userName}!</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            placeholderTextColor="#aaa"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your new password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProfile}>
            <Text style={styles.buttonText}>Delete Profile</Text>
          </TouchableOpacity>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </>
      ) : (
        <Text style={styles.errorText}>Authentication data not found. Please log in.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    width: '100%',
  },
  updateButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});

export default ProfileScreen;
