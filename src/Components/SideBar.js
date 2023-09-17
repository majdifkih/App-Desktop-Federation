import React, { useState } from 'react';
import { Image, Navbar, Nav, Modal, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import './SideBar.css';
import profil from '../images/logoo.png';

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleLogout = () => {
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <Image src={profil} roundedCircle style={{ width: '40px', height: '40px' }} />
      </div>

      <Navbar className="navbar">
        <div className="content">
          <Nav className="nav-items">
            <Link to="/home" className={`nav ${isActive('/home')}`}>
              <HomeIcon className="iconn" /> Accueil
            </Link>
            <Link to="/arbitre" className={`nav ${isActive('/arbitre')}`}>
              <PersonIcon className="iconn" /> Arbitres
            </Link>
            <Link to="/club" className={`nav ${isActive('/club')} ${location.pathname === '/club' ? 'club-active' : ''}`}>
              <SportsTennisIcon className="icon" /> Clubs
            </Link>
            <Link to="/joueurs" className={`nav ${isActive('/joueurs')}`}>
              <GroupsIcon className="icon" /> Joueurs
            </Link>
            <Link to="/parametre" className={`nav ${isActive('/parametre')}`}>
              <SettingsIcon className="icon" /> Compte
            </Link>
            <Link className="nav" onClick={handleShow}>
              <LogoutIcon className="icon" /> Déconnexion
            </Link>
          </Nav>
        </div>
      </Navbar>

      <Modal show={show} onHide={handleClose} style={{marginTop:"15%",marginLeft:"5%"}}>
        <Modal.Header closeButton>
          <Modal.Title>Déconnexion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir vous déconnecter ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button style={{ backgroundColor: '#E53935', borderColor:'#E53935' }} onClick={handleLogout}>
          <LogoutIcon/> Confirmer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SideBar;
