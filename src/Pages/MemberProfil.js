import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PouchDB from 'pouchdb';
import 'pouchdb-find';
import './MemberProfil.css'; // Assurez-vous d'importer correctement le fichier CSS
import logo from "../images/logoo.png"
import SideBar from '../Components/SideBar';

PouchDB.plugin(require('pouchdb-find'));

const localDB = new PouchDB('MembreDB');

const MemberProfile = () => {
  const { memberId } = useParams();
  const [memberDetails, setMemberDetails] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    // Charger les détails du membre à partir de la base de données locale
    fetchMemberDetails();
  }, [memberId]);

  const fetchMemberDetails = async () => {
    try {
      const response = await localDB.get(memberId);
      setMemberDetails(response); // Mettre à jour les détails du membre dans le state
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du membre :', error);
    }
  };

  const handlePrint = () => {
    window.print(); // Déclencher le processus d'impression du navigateur
  };


  return (
    
    
        <div className='profiljouer-container'>
        <div className='sidebarprofil'> 
        <SideBar />
        </div>
        <div className='profiljouer-main'>
        <div className="back-button" onClick={() => navigate(-1)}>
          <ArrowBackIcon  /> Liste de joueurs
        </div> 
        <div className="member-profile-container">
            
    {memberDetails ? (
      <div className="member-profile">
        <div className='headprofil'>
        <img src={logo} className='imglogo' />
        
      
        <img src={memberDetails.image} alt={memberDetails.nomPrenomMembre} className='imageProfil' />
      
      <div>
      <PrintIcon className='iconprint' onClick={handlePrint}/>
      </div>
      </div>
      
      <div className="member-details">
        <div className="member-details-row">
          <span className="detail-label">Licence :</span>
          <span className="detail-value">{memberDetails.licence}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Sexe :</span>
          <span className="detail-value">{memberDetails.sexe}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Catégorie :</span>
          <span className="detail-value">{memberDetails.categories}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Club :</span>
          <span className="detail-value">{memberDetails.nomClub}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Nom et Prénom :</span>
          <span className="detail-value">{memberDetails.nomPrenomMembre}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Date de naissance :</span>
          <span className="detail-value">{memberDetails.dateNaissance}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Lieu de naissance :</span>
          <span className="detail-value">{memberDetails.lieuNaissance}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Cin :</span>
          <span className="detail-value">{memberDetails.numeroCarteCIN}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Date de creation cin :</span>
          <span className="detail-value">{memberDetails.dateCreationCarteCIN}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Le cas :</span>
          <span className="detail-value">{memberDetails.cas}</span>
        </div>

        <div className="member-details-row">
          <span className="detail-label">Adresse :</span>
          <span className="detail-value">{memberDetails.adresse}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Etablissement :</span>
          <span className="detail-value">{memberDetails.etablissement}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Inscription :</span>
          <span className="detail-value">{memberDetails.status}</span>
        </div>

      </div>
    </div>
    ) : (
      <p>Chargement des détails du membre...</p>
    )}
  </div>
  </div>
  </div>

  );
};

export default MemberProfile;
