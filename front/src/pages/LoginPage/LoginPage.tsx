import React, { useContext, useState } from 'react';
import './LoginPage.css';
import { APIStatus } from '../../types';
import { AuthApi } from '../../api/auth';
import { ErrorMessage } from '../../components/error/error';
import { Loader } from '../../components/loader/loader';
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../components/AuthProvider/AuthProvider';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('' );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    if(password.length === 0 || username.length === 0) {
      setErrorMessage(LoginErrorMessages.required);
      return;
    }
    setIsLoading(true);
    const providedUsername = username; // To make sure we use the same username for login and the one we approve
    const res = await AuthApi.login({ username: providedUsername, password });
    setIsLoading(false);
    
    if (res === APIStatus.Success) {
      auth.setUser(providedUsername);
      console.log("Logged in as: ", auth.user);
      navigate("/");
      return;
    }
    // Handle other APIStatus - set proper error message (see LoginErrorMessages)
    if(res === APIStatus.BadRequest) {
      setErrorMessage(LoginErrorMessages.required);
      return;
    }
    if(res === APIStatus.ServerError) {
      setErrorMessage(LoginErrorMessages.failed);
      return;
    }
    if(res === APIStatus.Unauthorized) {
      setErrorMessage(LoginErrorMessages.invalid);
      return;
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form>
        <div className="input-group">
          <label htmlFor="username">Username:</label>
          <input
            disabled={isLoading}
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password:</label>
          <input
            disabled={isLoading}
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        {errorMessage && <ErrorMessage message={errorMessage}/>}
        {isLoading ? <Loader /> :<button type="button" className="login-btn" onClick={handleLogin}>Login</button>}
      </form>
      <p className="signup-link">Don't have an account? <button type="button" onClick={handleSignUp}>Sign Up</button></p>
    </div>
  );
};

const LoginErrorMessages = {
  required: 'Username and password are required',
  invalid: 'Invalid username or password',
  failed: 'Login failed, please try again'
};

// TODO - change the file name (To match other's format)