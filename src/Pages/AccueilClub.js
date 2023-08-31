import React, { useEffect, useState } from 'react';
import { Link, useParams,useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SideBar from '../Components/SideBar';
import joueur from '../images/joueur.png';
import membreadmin from '../images/membreadmin.png';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import './AccueilClub.css';
PouchDB.plugin(PouchDBFind);
const localDB = new PouchDB('club_db');
function AccueilClub() {
  const navigate = useNavigate();
    const { clubId } = useParams();
    const [clubIdd, setClubIdd] = useState('');
  const [club, setClub] = useState({});
  const [clubName, setClubName] = useState('');
  useEffect(() => {
    localDB.get(clubId)
      .then((result) => {
        setClub(result);
        setClubName(result.nomclub);
      })
      .catch((error) => {
        console.error('Error fetching club:', error);
      });
  }, [clubId]);
  return (
    <div className='headaccueilclub'>
  
        <SideBar />
        
        <div>
        <div className="backbtn-accueil" onClick={() => navigate(-1)}>
          <ArrowBackIcon  /> Liste des clubs
        </div> 
        <h1 className='title-accueil-club'>Accueil du club: {clubName}</h1>
        <div className='accueilclubcontainer'>
            
          <div className='cardacc'>
          <Link to={`/club/${club._id}/members?clubId=${club._id}`}>
              <div
                className='cardacc-content'
                style={{
                  backgroundImage: `url(${joueur})`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}
              >
                Joueurs
              </div>
            </Link>
          </div>
          <div className='cardacc'>
            <Link to={`/club/${club._id}/memberadmin?clubId=${club._id}`}>
              <div
                className='cardacc-content'
                style={{
                  backgroundImage: `url(${membreadmin})`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}
              >
                Membre Administrative
              </div>
            </Link>
          </div>
        </div>
        </div>
      
    </div>
  );
}

export default AccueilClub;
