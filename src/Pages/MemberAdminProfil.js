import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PouchDB from 'pouchdb';
import 'pouchdb-find';
import './MemberProfil.css'; // Assurez-vous d'importer correctement le fichier CSS
import logo from "../images/logoo.png"
import SideBar from '../Components/SideBar';

PouchDB.plugin(require('pouchdb-find'));

const localDB = new PouchDB('MembreAdminDB');

const MemberAdminProfil = () => {
  const { memberadminId } = useParams();
  const navigate = useNavigate();
  const [memberAdminDetails, setMemberAdminDetails] = useState(null);

  useEffect(() => {
    fetchMemberAdminDetails();
  }, [memberadminId]);

  const fetchMemberAdminDetails = async () => {
    try {
      const response = await localDB.get(memberadminId);
      setMemberAdminDetails(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du membre :', error);
    }
  };

  const handlePrint = () => {
    window.print(); // Déclencher le processus d'impression du navigateur
  };


  return (
    
    <div className='headermemberadmin-container' >
        <div className='sidebarprofil'>
        <SideBar/>
        </div>
        <div className="back-buttonadmin" onClick={() => navigate(-1)}>
          <ArrowBackIcon  /> Liste Membre Administrative
        </div>        
        <div className="member-profile-container">
            
    {memberAdminDetails ? (
      <div className="memberadmin-profile">
        <div className='headprofil'>
         <img src={logo} className='imglogoad' />
        
      
       {/* <img src={memberAdminDetails.image} alt={memberAdminDetails.nomPrenomMembre} className='imageProfil' />
       */}
      <div>
      <PrintIcon className='iconprintad' onClick={handlePrint}/>
      </div>
      </div>
      
      <div className="member-details">
        <div className="member-details-row">
          <span className="detail-label">Nom :</span>
          <span className="detail-value">{memberAdminDetails.nom}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Prénom :</span>
          <span className="detail-value">{memberAdminDetails.prenom}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Sexe :</span>
          <span className="detail-value">{memberAdminDetails.sexe}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Téléphone :</span>
          <span className="detail-value">{memberAdminDetails.tel}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Fax :</span>
          <span className="detail-value">{memberAdminDetails.fax}</span>
        </div>
        <div className="member-details-row">
          <span className="detail-label">Rôle :</span>
          <span className="detail-value">{memberAdminDetails.role}</span>
        </div>
        
        <div className="member-details-row">
          <span className="detail-label">Inscription :</span>
          <span className="detail-value">{memberAdminDetails.status}</span>
        </div>

      </div>
    </div>
    ) : (
      <p>Chargement des détails du membre...</p>
    )}
  </div>
  </div>
  );
};

export default MemberAdminProfil;
