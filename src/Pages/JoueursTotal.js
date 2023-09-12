import {Table, Modal, Button, Alert ,Dropdown} from 'react-bootstrap';
import { Pagination as AntdPagination,Select  } from 'antd';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import ListIcon from '@mui/icons-material/List';
import Person2Icon from '@mui/icons-material/Person2';
import DeleteIcon from '@mui/icons-material/Delete';
import jsPDF from 'jspdf';
import './ListMember.css';
import { useEffect, useState } from 'react';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import {  useLocation, useParams,useNavigate} from 'react-router-dom';

import SideBar from '../Components/SideBar';
PouchDB.plugin(PouchDBFind);
const localDB = new PouchDB('MembreDB');
const { Option } = Select;

const ListJoueur = () => {
  const navigate = useNavigate();
  
  const location = useLocation();
  const [joueur, setJoueur] = useState([]);
    const [id , setId] = useState('')
    const [numFemmes, setNumFemmes] = useState(0);
    const [numHommes, setNumHommes] = useState(0);
    const [numNonInscrits, setNumNonInscrits] = useState(0);
    const [numInscrits, setNumInscrits] = useState(0);
  


      useEffect(() => {
        fetchData();
      }, []);
    
      const fetchData = async () => {
        try {
          const result = await localDB.allDocs({ include_docs: true });
          const currentTime = new Date();
          const updatedJoueurs = result.rows
            .map(row => row.doc)
            .map(joueur => {
              const registrationDate = new Date(joueur.dateInscription); // Changer le champ avec le champ de la date d'inscription réel
              const timeDiff = currentTime - registrationDate;
              const daysDiff = timeDiff / (1000 * 3600 * 24);
              if (joueur.status === 'inscrit' && daysDiff >= 365) {
                joueur.status = 'non inscrit';
              }
              return joueur;
            });
             // Calculer les statistiques
    const Femmes = updatedJoueurs.filter(joueur => joueur.sexe === 'Femme').length;
    const Hommes = updatedJoueurs.filter(joueur => joueur.sexe === 'Homme').length;
    const nonInscrits = updatedJoueurs.filter(joueur => joueur.status === 'non inscrit').length;
    const inscrits = updatedJoueurs.filter(joueur => joueur.status === 'inscrit').length;

    setNumFemmes(Femmes);
    setNumHommes(Hommes);
    setNumNonInscrits(nonInscrits);
    setNumInscrits(inscrits);

    setJoueur(updatedJoueurs);
          setJoueur(updatedJoueurs);
        } catch (error) {
          console.error('Erreur lors de la récupération des données :', error);
        }
      };
  
  // DELETE Joueur
  const deleteJoueur = async (idToDelete) => {
    try {
      const existingDoc = await localDB.get(idToDelete);
  
        // Supprimer le document en utilisant son _id et _rev
        await localDB.remove(existingDoc._id, existingDoc._rev);
  
        setJoueur((prevJoueurs) => prevJoueurs.filter((item) => item._id !== idToDelete));
        handleDelClose();
      
        fetchData(); // Rafraîchir les données après la suppression
  
        // Fermer le modal de suppression ici
        handleDelClose();
  
    } catch (error) {
      console.error('Erreur lors de la suppression dans PouchDB :', error);
      return false;
    }
  };



    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState("nomPrenom"); // Par défaut, tri par nom
    const [currentPage, setCurrentPage] = useState(1);

      
      
        const handleDelShow = (iddel) =>{
         
          joueur.forEach ( c =>{
           if (c._id == iddel){
                setId(c._id);
               
             console.log(c)
           }
          })
          setDelShow(true);}

//SEARCH
const filteredMembres = joueur.filter(joueur => {
    const fullName = `${joueur.nomPrenomMembre}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });
  
  //TRIE
  const sortedAndFilteredMembres = [...filteredMembres].sort((a, b) => {
    if (sortOption === "nomPrenom") {
      return (a.nomPrenomMembre || "").localeCompare(b.nomPrenomMembre || "");
    } else if (sortOption === "categories") {
      return (a.categories || "").localeCompare(b.categories || "");
    } else if (sortOption === "club") {
      return (a.nomClub || "").localeCompare(b.nomClub || "");
    }
    return 0;
  });

  

  //modal DELETE
  const [Delshow, setDelShow] = useState(false);
  const handleDelClose = () => setDelShow(false);

  

  
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page

  //Pagination
  const joueursPerPage = 2; // Nombre d'utilisateurs par page
  const indexOfLastJoueur = currentPage * rowsPerPage;
  const indexOfFirstJoueur = indexOfLastJoueur - rowsPerPage;
  const currentJoueurs = sortedAndFilteredMembres.slice(indexOfFirstJoueur, indexOfLastJoueur);
  

const handleRowsPerPageChange = value => {
  setRowsPerPage(value);
  setCurrentPage(1); // Reset to the first page when changing rows per page
};

//PRINT DATA 

const ListJoueurPDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(20);
    doc.setTextColor(0, 128, 0);
    doc.setFont('bold');
    doc.text('Liste des Membres', 20, 20);

    const tableData = joueur.map((joueur, index) => [
      index + 1,
      { content: joueur.nomPrenomMembre, styles: 'cellStyle' },
      joueur.nomClub,
      joueur.categories,
      joueur.status,
    ]);
    
    const tableHeaders = ['#', 'Nom et Prénom', 'Club', 'Categorie', 'status'];
  
    const styles = { 
        headStyles: { fillColor: [255, 0, 0] },   };
    const columnStyles = {
      1: { cellWidth: 'auto' },
      
    };



  
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 30,
      styles,
      columnStyles,
      
    });
  
    // Attacher un gestionnaire d'événements au téléchargement du PDF
    doc.output('dataurlnewwindow', {
      filename: 'ListeJoueur.pdf',
      callback: () => {
        // Afficher une alerte après le téléchargement
        window.alert('Téléchargement réussi : ListeJoueur.pdf');
      },
    });
    doc.save('ListeJoueur.pdf');

  };
  
    return(
        <div className='joueurcontient'>
            <SideBar/>
            <div className='membermain'>
            <h2 className='title-joueur-total'>Liste de tous les joueurs</h2>
            <div className='cardstatjoueuer'>
  <div className='cardcont'>
    <div>
      Joueurs femme:<br/><br/> <center> {numFemmes}</center>
    </div>
    {/* Afficher le nombre de joueurs féminins ici */}
  </div>
  <div className='cardcont'>
    <div>
      Joueurs homme:<br/><br/> <center>{numHommes}</center>
    </div>
    {/* Afficher le nombre de joueurs masculins ici */}
  </div>
  <div className='cardcont'>
    <div>
      Joueurs non inscrit:<br/><br/> <center> {numNonInscrits}</center>
    </div>
    {/* Afficher le nombre de joueurs non inscrits ici */}
  </div>
  <div className='cardcont'>
    <div>
      Joueurs inscrit:<br/><br/> <center> {numInscrits}</center>
    </div>
    {/* Afficher le nombre de joueurs inscrits ici */}
  </div>
</div>

            
            <div className='containermember'>
           

      
{/*Recherche*/}
<div className='searchjoueur-container'>
                <SearchIcon className='searchjoueur-icon' />
                <input
                  type="text"
                  placeholder="Rechercher"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='searchjoueur'
                />
              </div>


<div  className='headbtnjoueurs'>

<Tooltip title="Télécharger">
     <DownloadForOfflineIcon onClick={ListJoueurPDF} sx={{ fontSize: 40,color: 'gray',cursor: 'pointer' }} />
     </Tooltip>

     {/*Trie*/}
     <div className="sort-options">
  <label>Trier par :</label>
  <select
    value={sortOption}
    onChange={(e) => {
        console.log(e.target.value); // Ajoutez cette ligne pour vérifier la valeur
        setSortOption(e.target.value);
      }}
  >
    <option value="nomPrenom">Nom</option>
    <option value="club">Club</option>
    <option value="categories">Catégories</option>
  </select>
</div>
</div>
    


 {sortedAndFilteredMembres ? (
 <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Nom et Prénom</th>
            <th>Club</th>
            <th>Catégories</th>
            <th>Photo</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentJoueurs.map((joueur, index) => (
            <tr key={joueur._id}>
              <td>{index + 1}</td>
              <td>{joueur.nomPrenomMembre}</td>
              <td>{joueur.nomClub}</td>
              <td>{joueur.categories}</td>
              <td>
                <img src={joueur.image} alt="" width="50" />
              </td>
        <td>
  {joueur.status === 'inscrit' ? (
    <Button
    style={{backgroundColor:"#6fb551",borderColor: '#6fb551'}}
      className='btnstatus'
   >
      Inscrit
    </Button>
  ) : (
    <Button
    style={{ backgroundColor: "#ea5252", borderColor: "#ea5252" }}
    className='btnstatus'
    >
      Non Inscrit
    </Button>
  )}
</td>

              <td>
      <Dropdown>
  <Dropdown.Toggle variant="link" id="dropdown-basic" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }} className="custom-dropdown-toggle">
    <ListIcon sx={{color:'gray'}}/>
   
  </Dropdown.Toggle>

  <Dropdown.Menu>
    <Dropdown.Item onClick={() => navigate(`/member/${joueur._id}`)}><Person2Icon sx={{color:'gray'}}/>Profil de joueur </Dropdown.Item>
    <Dropdown.Item onClick={() => handleDelShow(joueur._id)}><DeleteIcon sx={{color:'gray'}}/>Supprimer</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>
    </td>
            </tr>
          ))}
        </tbody>
      </Table>
      ) : (
        <Alert variant='light'>
       Aucun joueur trouvé ...
      </Alert>
)}

      {/* Pagination */}
      <div className='pagination'>
      <AntdPagination
        current={currentPage}
        total={sortedAndFilteredMembres.length}
        pageSize={rowsPerPage}
        onChange={setCurrentPage}
      />
       {/* Rows per page selector */}
       <Select
            style={{ marginLeft: '10px' }}
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            <Option value={10}>10 lignes</Option>
            <Option value={20}>20 lignes</Option>
            <Option value={50}>50 lignes</Option>
            <Option value={100}>100 lignes</Option>
            {/* Add more options as needed */}
          </Select>
          </div>

 
{/*Popup supprimer*/}
<Modal show={Delshow} onHide={handleDelClose}>
  <Modal.Header closeButton>
    <Modal.Title>Suppression</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>Êtes-vous sûr de vouloir supprimer cet joueur ?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleDelClose}>
      Annuler
    </Button>
    <Button variant="danger" onClick={() => deleteJoueur(id)}>
      Confirmer
    </Button>
  </Modal.Footer>
</Modal>
</div>
</div>
</div>
    )
}
export default ListJoueur;