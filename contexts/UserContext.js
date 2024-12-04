import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

// Custom hook to access the UserContext
export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState(null); // Initialize the state

  return (
    <UserContext.Provider value={{ userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
};
