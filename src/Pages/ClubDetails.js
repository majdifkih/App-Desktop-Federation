import React, { useEffect, useState } from 'react';
import {  useNavigate,useParams } from 'react-router-dom';
import PouchDB from 'pouchdb';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import 'pouchdb-find';
import { filter, countBy } from 'lodash';
import SideBar from '../Components/SideBar';
import './ClubDetails.css';
const clubDB = new PouchDB('club_db');
const memberAdminDB = new PouchDB('MembreAdminDB');
const joueurDB = new PouchDB('MembreDB');
const ClubDetails = () => {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const [clubDetails, setClubDetails] = useState({});
  const [clubName, setClubName] = useState('');

  const [members, setMembers] = useState([]);
  const [joueurs, setJoueurs] = useState({});
  const [presidentName, setPresidentName] = useState('');
  const [vicePresidentName, setVicePresidentName] = useState('');
  const [coachName, setCoachName] = useState('');
  const [relationsName, setRelationsName] = useState('');
  const [totalPlayersByCategory, setTotalPlayersByCategory] = useState({});
  const [totalHommePlayers, setTotalHommePlayers] = useState(0);
  const [totalFemmePlayers, setTotalFemmePlayers] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubDoc = await clubDB.get(clubId);
        setClubDetails(clubDoc);
        setClubName(clubDoc.nomclub);

        const result = await memberAdminDB.allDocs({ include_docs: true });
        const updatedMembadmins = result.rows
          .map(row => row.doc)
          .filter(membadmin => membadmin.clubId === clubId);
          
        setMembers(updatedMembadmins);

        // Set names based on roles
        setPresidentName(getNameByRole(updatedMembadmins, 'Président'));
        setVicePresidentName(getNameByRole(updatedMembadmins, 'Vice-Président'));
        setCoachName(getNameByRole(updatedMembadmins, 'Entraineur'));
        setRelationsName(getNameByRole(updatedMembadmins, 'Responsable des relations'));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    joueurDB.find({
        selector: { clubId: clubId }
      }).then((result) => {
        const playersByCategory = countBy(result.docs, 'categories'); // Utilisez 'categories' au lieu de 'categorie'
        const HommePlayers = filter(result.docs, { sexe: 'Homme' });
        const FemmePlayers = filter(result.docs, { sexe: 'Femme' });
      
        setTotalPlayersByCategory(playersByCategory);
        setTotalHommePlayers(HommePlayers.length);
        setTotalFemmePlayers(FemmePlayers.length);
      
        // Initialize all categories with 0 players
        const totalPlayersByCategory = {};
        const allCategories = ['U11', 'U13', 'U15', 'U17', 'U19', 'Senior'];
        allCategories.forEach(category => {
          totalPlayersByCategory[category] = playersByCategory[category] || 0;
        });
         
      
        setTotalPlayersByCategory(totalPlayersByCategory);
      });
      

    fetchData();
  }, [clubId]);

  const getNameByRole = (members, role) => {
    const memberWithRole = members.find(member => member.role === role);
    return memberWithRole ? `${memberWithRole.prenom} ${memberWithRole.nom}` : '';
  };

  return (
    <div className="club-details-container">

      <SideBar />
      <div className="backbtn-detail-club" onClick={() => navigate(-1)}>
          <ArrowBackIcon  /> Liste des clubs
        </div> 
      <h2 className='title-Detailclub'>Détails du club: {clubName}</h2>
<img src={clubDetails.image} alt={clubDetails.nomClub} className='img-detail-club'/>
<h2 className='title-Detaillub'>{clubDetails.nomClub}</h2>

{/* Groupe : Informations club */}
<fieldset className='info-group'>
  <legend>Informations club</legend>
  <p className='details-items'><span className='items-contient'>Solde :</span> {clubDetails.solde}</p>
  <p className='details-items'><span className='items-contient'>Date de création :</span> {clubDetails.datecreation}</p>
  <p className='details-items'><span className='items-contient'>Statut du club :</span> {clubDetails.statusclub}</p>
</fieldset>

{/* Groupe : Informations membres Administratifs */}
<fieldset className='info-group'>
  <legend>Informations membres Administratifs</legend>
  <p className='details-items'><span className='items-contient'>Nom du Président :</span> {presidentName}</p>
  <p className='details-items'><span className='items-contient'>Nom du Vice-Président :</span> {vicePresidentName}</p>
  <p className='details-items'><span className='items-contient'>Nom de l'Entraîneur :</span> {coachName}</p>
  <p className='details-items'><span className='items-contient'>Nom du Responsable des relations :</span> {relationsName}</p>
</fieldset>

{/* Groupe : Informations Joueurs */}
<fieldset className='info-group'>
  <legend>Informations Joueurs</legend>
  {/* <div className='statistics'> */}
  <p className='details-items'><span className='items-contient'>Nombre total de joueurs :</span> {totalHommePlayers + totalFemmePlayers}</p>
  <p className='details-items'><span className='items-contient'>Nombre total de joueurs masculins :</span> {totalHommePlayers}</p>
  <p className='details-items'><span className='items-contient'>Nombre total de joueurs féminins :</span>  {totalFemmePlayers}</p>
  {Object.keys(totalPlayersByCategory).map((category) => (
      <p key={category} className='details-items'><span className='items-contient'>Nombre de joueurs {category} :</span> {totalPlayersByCategory[category]}</p>
    ))}
    {/* </div> */}
</fieldset>
    
    </div>
  );
};


export default ClubDetails;
