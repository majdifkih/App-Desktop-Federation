import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PouchDB from 'pouchdb';
import 'pouchdb-find';
import './ArbitreProfil.css'; // Assurez-vous d'importer correctement le fichier CSS
import logo from "../images/logoo.png"
import SideBar from '../Components/SideBar';

PouchDB.plugin(require('pouchdb-find'));

const localDB = new PouchDB('arbitre_db');

const ArbitreProfil = () => {
  const { arbitreId } = useParams();
  const navigate = useNavigate();
  const [arbitreDetails, setArbitreDetails] = useState(null);

  useEffect(() => {
    // Charger les détails du membre à partir de la base de données locale
    fetchArbitreDetails();
  }, [arbitreId]);

  const fetchArbitreDetails = async () => {
    try {
      const response = await localDB.get(arbitreId);
      setArbitreDetails(response); // Mettre à jour les détails du membre dans le state
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du membre :', error);
    }
  };

  const handlePrint = () => {
    window.print(); // Déclencher le processus d'impression du navigateur
  };


  return (
    
    <div className='arbiprofil-container'>
        <div className='sidebarprofil'> 
        <SideBar />
        </div>
     
        <div className='arbprofil'>
        <div className="back-buttonarb" onClick={() => navigate(-1)}>
          <ArrowBackIcon  /> Liste d'arbitres
        </div> 
        <div className="arbitre-profile-container">
            
    {arbitreDetails ? (
      <div className="arbitre-profile">
        <div className='headprofil'>
        <img src={logo} className='imglogo' />
        
      
        <img src={arbitreDetails.image} alt={arbitreDetails.nomPrenom} className='imageProfil' />
      
      <div>
      <PrintIcon className='iconprint' onClick={handlePrint}/>
      </div>
      </div>
      
      <div className="arbitre-details">
        <div className="arbitre-details-row">
          <span className="detail-label">Nom et prenom :</span>
          <span className="detail-value">{arbitreDetails.nomPrenom}</span>
        </div>
        <div className="arbitre-details-row">
          <span className="detail-label">Sexe :</span>
          <span className="detail-value">{arbitreDetails.sexe}</span>
        </div>
        <div className="arbitre-details-row">
          <span className="detail-label">Date de naissance :</span>
          <span className="detail-value">{arbitreDetails.dateNaissance}</span>
        </div>
        <div className="arbitre-details-row">
          <span className="detail-label">CIN :</span>
          <span className="detail-value">{arbitreDetails.cin}</span>
        </div>
        <div className="arbitre-details-row">
          <span className="detail-label">Date creation CIN :</span>
          <span className="detail-value">{arbitreDetails.dateCreationCIN}</span>
        </div>
        <div className="arbitre-details-row">
          <span className="detail-label">Téléphone :</span>
          <span className="detail-value">{arbitreDetails.telephone}</span>
        </div>
        <div className="arbitre-details-row">
          <span className="detail-label">Email :</span>
          <span className="detail-value">{arbitreDetails.email}</span>
        </div>
        <div className="arbitre-details-row">
          <span className="detail-label">Adresse :</span>
          <span className="detail-value">{arbitreDetails.adresse}</span>
        </div>
        <div className="arbitre-details-row">
          <span className="detail-label">Profession :</span>
          <span className="detail-value">{arbitreDetails.profession}</span>
        </div>
        <div className="arbitre-details-row">
          <span className="detail-label">Diplôme :</span>
          <span className="detail-value">{arbitreDetails.diplome}</span>
        </div>

        <div className="arbitre-details-row">
          <span className="detail-label">Status :</span>
          <span className="detail-value">{arbitreDetails.status}</span>
        </div>

      </div>
    </div>
    ) : (
      <p>Chargement des détails du arbitre...</p>
    )}
  </div>
  </div>
  </div>
  );
};

export default ArbitreProfil;
