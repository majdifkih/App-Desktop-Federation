import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import bcrypt from 'bcryptjs';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { message } from 'antd';

PouchDB.plugin(PouchDBFind);
const adminDB = new PouchDB('admin');

const ConfigurationCompte = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showAncienPassword, setShowAncienPassword] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [ancienPassword, setAncienPassword] = useState('');

    const handleChangeInfo = async () => {
        if (newUsername.trim() === '' || newPassword.trim() === '' || ancienPassword.trim() === '') {
            // Afficher une notification d'erreur si les champs sont vides
            message.error({
                content: 'Veuillez remplir tous les champs.',
                duration: 3
            });
            return;
        }

        try {
            const admin = await adminDB.get('admin');
            const isPasswordCorrect = await bcrypt.compare(ancienPassword, admin.password);

            if (!isPasswordCorrect) {
                // Afficher une notification d'erreur si le mot de passe actuel est incorrect
                message.error({
                    content: 'Ancien mot de passe incorrect.',
                    duration: 3
                });
                return;
            }

            admin.username = newUsername;

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            admin.password = hashedPassword;

            await adminDB.put(admin);
            console.log('Admin updated successfully.');

            // Afficher une notification de succès
            message.success({
                content: 'Changements effectués avec succès !',
                duration: 3
            });

            // Réinitialiser les champs après le succès
            setNewUsername('');
            setNewPassword('');
            setAncienPassword('');
        } catch (error) {
            console.error('Error updating admin:', error);
            // Afficher une notification d'erreur
            message.error({
                content: 'Une erreur est survenue lors de la mise à jour.',
                duration: 3
            });
        }
    };

    return (
        <div>
            <header style={{ marginTop: "2%" }}>
                <h3>Changer les informations</h3>
            </header>
            <div style={{ margin: "5% 20% 0 20%" }}>
                <Form.Label htmlFor="user">Utilisateur</Form.Label>
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder="Changer utilisateur"
                        onChange={(e) => setNewUsername(e.target.value)}
                    />
                </InputGroup>
                <Form.Label htmlFor="inputPassword5" style={{ marginTop: "5%" }}>Ancien mot de passe</Form.Label>
                <InputGroup>
                    <Form.Control
                        type={showAncienPassword ? "text" : "password"}
                        placeholder="Ancien mot de passe"
                        value={ancienPassword}
                        onChange={(e) => setAncienPassword(e.target.value)}
                    />
                    <InputGroup.Text
                        className="password-icon"
                        onClick={() => setShowAncienPassword(!showAncienPassword)}
                    >
                        <FontAwesomeIcon icon={showAncienPassword ? faEyeSlash : faEye} />
                    </InputGroup.Text>
                </InputGroup>
                <Form.Label htmlFor="inputPassword5" style={{ marginTop: "5%" }}>Nouveau mot de passe</Form.Label>
                <InputGroup>
                    <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Nouveau mot de passe"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <InputGroup.Text
                        className="password-icon"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </InputGroup.Text>
                </InputGroup>
                <Button variant="success" onClick={handleChangeInfo} style={{ margin: "5% 0 10%" }}>
                    Confirmer
                </Button>
            </div>
        </div>
    );
}

export default ConfigurationCompte;
