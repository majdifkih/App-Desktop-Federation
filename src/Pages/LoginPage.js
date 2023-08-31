import React, { useEffect, useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress
import './LoginPage.css';

PouchDB.plugin(PouchDBFind);
const adminDB = new PouchDB('admin');

const LoginPage = () => {
  const navigate = useNavigate(); // Récupère l'objet d'historique
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const createAdmin = async () => {
    try {
      const existingAdmin = await adminDB.get('admin');
      console.log('Admin already exists:', existingAdmin);
    } catch (error) {
      if (error.name === 'not_found') {
        // Le document admin n'existe pas encore, donc créez-le
        const adminCredentials = {
          _id: 'admin',
          username: 'majdi',
          password: 'Majdi12345' // Assurez-vous de stocker le mot de passe de manière sécurisée
        };
  
        try {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(adminCredentials.password, saltRounds);
        
          adminCredentials.password = hashedPassword;
        
          await adminDB.put(adminCredentials);
          console.log('Admin created successfully.');
        } catch (error) {
          console.error('Error creating admin:', error);
        }
      } else {
        console.error('Error getting admin:', error);
      }
    }
  };
  
  useEffect(() => {
    createAdmin();
  }, []);

  
  const authenticateAdmin = async (username, password) => {
    try {
      const admin = await adminDB.get('admin');
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (admin.username === username && isPasswordValid) {
        console.log('Authentification réussie');
        navigate('/home'); // Utilisez history pour rediriger
      } else {
        setUsernameError(admin.username !== username);
        setPasswordError(!isPasswordValid);
      }
    } catch (error) {
      console.error('Erreur lors de l\'authentification de l\'admin:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target[0].value;
    const password = e.target[1].value;

    setIsLoading(true);

    await authenticateAdmin(username, password);

    setIsLoading(false);
  };
  // if (isLoading) {
  //   return <CircularProgress style={{ margin: 'auto' }} />; // Show loading spinner
  // }
  const handlePasswordClick = () => {
    setPasswordError(false); // Remettre à zéro l'état d'erreur du mot de passe
  };
  const handleUserNameClick = () => {
    setUsernameError(false); // Remettre à zéro l'état d'erreur du mot de passe
  };
  return (
    <div className="logincontainer">
      <div className="logincontent">
        <div className="form-container">
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Utilisateur</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrer l'utilisateur"
                isInvalid={usernameError} // Définissez isInvalid en fonction de l'état d'erreur
                onClick={handleUserNameClick}
              />
              <Form.Control.Feedback type="invalid">
                Utilisateur incorrect
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrer le mot de passe"
                  isInvalid={passwordError} // Définissez isInvalid en fonction de l'état d'erreur
                  onClick={handlePasswordClick}
                />
                <InputGroup.Text
                  className="password-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                {passwordError ? null : (
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                    />
                  )}
                </InputGroup.Text>
                <Form.Control.Feedback type="invalid">
                  Mot de passe incorrect
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Button className="login-btn" type="submit">
              Connexion
            </Button>
          </Form>
        </div>
      </div>
      <div className="loginimage"></div>
    </div>
  );
};

export default LoginPage;
