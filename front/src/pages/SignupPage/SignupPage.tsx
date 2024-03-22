import React, { useState } from 'react';
import './SignupPage.css';
import { AuthApi } from '../../api/auth';
import { APIStatus } from '../../types';
import { ErrorMessage } from '../../components/error/error';
import { Loader } from '../../components/loader/loader';
import { useNavigate } from "react-router-dom";

export const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSignUp = async () => {
    if(password.length === 0 || username.length === 0) {
        setErrorMessage(SignUpErrorMessages.required);
        return;
      }
    setIsLoading(true);
    const res = await AuthApi.signUp({ username, password });
    setIsLoading(false);

    if (res === APIStatus.Success) {
      navigate("/login");
      return;
    }
    // Handle other APIStatus - set proper error message (see SignUpErrorMessages)
    if (res === APIStatus.BadRequest) {
      setErrorMessage(SignUpErrorMessages.exists);
      return;
    }
    
    else { //res === APIStatus.ServerError 
      setErrorMessage(SignUpErrorMessages.failed);
      return;
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form>
        <div className="input-group">
          <label htmlFor="username">Username:</label>
          <input
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
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        {errorMessage && <ErrorMessage message={errorMessage}/>}
        {isLoading ? <Loader /> : <button type="button" className="signup-btn" onClick={handleSignUp}>Sign Up</button>}
      </form>
      <p className="login-link">Already have an account? <button type="button" onClick={handleLogin}>Login</button></p>
    </div>
  );
};

const SignUpErrorMessages = {
    required: 'Username and password are required',
    exists: 'Username already exists',
    failed: 'Sign Up failed, please try again'
};
// TODO - change the file name (To match other's format)