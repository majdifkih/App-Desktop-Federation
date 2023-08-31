import {Table, Form, Modal, Button, Alert,Dropdown } from 'react-bootstrap';
import { Pagination as AntdPagination,Select  } from 'antd';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import SearchIcon from '@mui/icons-material/Search';
import ListIcon from '@mui/icons-material/List';
import Tooltip from '@mui/material/Tooltip';
import Groups2Icon from '@mui/icons-material/Groups2';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Person2Icon from '@mui/icons-material/Person2';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEffect, useState } from 'react';
import './ListClub.css';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Link, useNavigate } from 'react-router-dom';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import SideBar from '../Components/SideBar';
PouchDB.plugin(PouchDBFind);
const localDB = new PouchDB('club_db');
const localDBJoueurs = new PouchDB('MembreDB'); // Initialisez la base de données des joueurs
const localDBMembresAdmin = new PouchDB('MembreAdminDB');
const { Option } = Select;
function ListerClub() {
  const navigate = useNavigate();
  const [club, setClub] = useState([]);
  const [id , setId] = useState('')
  const [identifiant , setIdentifiant] = useState('')
  const [nomclub , setNomClub] = useState('')
  const [solde, setSolde] = useState(0)
  const [image, setImage] = useState(null)
  const [statusclub, setStatusclub] = useState('')
  const [telephone, setTelephone] = useState('');
  const [totalMembers, setTotalMembers] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState("nom"); // Par défaut, tri par nom
  const [currentPage, setCurrentPage] = useState(1);
 
  useEffect(() => {
    
    fetchData(); // Mettre à jour les données des clubs, si nécessaire
    updateClubBalances(); // Mettre à jour les soldes des clubs chaque année
  }, []);
  
  const fetchData = async () => {
    try {
      const result = await localDB.allDocs({ include_docs: true });
      const clubsWithData = await Promise.all(
        result.rows.map(async (row) => {
          const club = row.doc;
          const clubJoueurs = await localDBJoueurs.find({
            selector: { clubId: club._id },
          });
          const clubMembresAdmin = await localDBMembresAdmin.find({
            selector: { clubId: club._id },
          });
          const totalJoueurs = clubJoueurs.docs.length;
          const totalMembresAdmin = clubMembresAdmin.docs.length;
          const totalMembers = totalJoueurs + totalMembresAdmin;
  
          const unregisteredJoueurs = await localDBJoueurs.find({
            selector: { clubId: club._id, status: 'non inscrit' },
          });
          const unregisteredMembresAdmin = await localDBMembresAdmin.find({
            selector: { clubId: club._id, status: 'non inscrit' },
          });
          const totalUnregisteredMembers =
            unregisteredJoueurs.docs.length + unregisteredMembresAdmin.docs.length;
  
          return { ...club, totalMembers, totalUnregisteredMembers };
        })
      );
      setClub(clubsWithData);
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };
  


  const isDuplicate = club.some(club => club.identifiant === identifiant);

  //ADD Club


const AddClub = async (e) => {
  e.preventDefault();
  try {
    const _id = uuidv4();

    let base64Image = null; // Initialiser base64Image à null
    
    
    if (image) {
      // Convertir l'image Blob en base64 seulement si une image est fournie
      const reader = new FileReader();
      reader.onload = function (event) {
        base64Image = event.target.result;

        // Appel à votre logique d'ajout de club
        addClubWithData(_id, base64Image);
      };

      reader.readAsDataURL(image);
    } else {
      // Appel à votre logique d'ajout de club sans image
      addClubWithData(_id, base64Image);
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du club :', error);
  }
};

const addClubWithData = async (_id, base64Image) => {
  try {
    // Récupérer les données des joueurs et des membres administratifs
    const resultjoueur = await localDBJoueurs.allDocs({ include_docs: true });
    const resultmemberadmin = await localDBMembresAdmin.allDocs({ include_docs: true });

    const clubJoueurs = resultjoueur.rows.map(row => row.doc).filter(doc => doc.clubId === _id);
    const clubMembresAdmin = resultmemberadmin.rows.map(row => row.doc).filter(doc => doc.clubId === _id);

    const totalJoueurs = clubJoueurs.length;
    const totalMembresAdmin = clubMembresAdmin.length;

    const newTotalMembers = totalJoueurs + totalMembresAdmin;
  
    const newClub = {
      _id,
      identifiant,
      nomclub,
      telephone,
      totalMembers: newTotalMembers, // Mettez à jour le champ totalMembers
      solde:Math.max(solde, 0),
      statusclub: solde === 0 ? 'non actif' : statusclub, // Set status based on solde
      image: base64Image,
      datecreation: format(new Date(), 'yyyy/MM/dd hh:mm:ss')
    };

    // Insérer le nouveau document dans la base locale (PouchDB)
    await localDB.put(newClub);

    // Afficher un message de succès à l'utilisateur
    console.log('Club ajouté avec succès');

    // Réinitialiser les valeurs et rafraîchir les données
    handleAddClose();
    setIdentifiant('');
    setNomClub('');
    setTelephone('');
    setSolde('');
    setImage(null);
    fetchData();
  } catch (error) {
    console.error('Erreur lors de la récupération des données ou de l\'ajout du club :', error);
    // Afficher un message d'erreur à l'utilisateur
  }
};


  const handleEditShow = (id) =>{
   
    club.forEach ( c =>{
     if (c._id == id){
      setId(c._id);
          setIdentifiant(c.identifiant);
          setNomClub(c.nomclub);
          setTelephone(c.telephone);
          setTotalMembers(c.totalMembers);
          setSolde(c.solde);
          setImage(c.image);
          setStatusclub(c.statusclub);
       console.log(c)
     }
    })
    setEditShow(true);}



  const handleDelShow = (iddel) => {
    setId(iddel); 
    setDelShow(true); 
  };

//UPDATE Club
const updateClub = async () => {
  try {
    const existingDoc = await localDB.get(id);
  
    const updatedSolde = Math.max(solde, 0);
   

   
    let updateStatus
    // Vérifier si le solde est passé à zéro et le statut n'était pas déjà 'actif'
    if (updatedSolde === 0 && existingDoc.statusclub === 'non actif') {
      updateStatus = 'actif';
    }
    const updatedDoc = {
      ...existingDoc,
      nomclub,
      identifiant,
      telephone,
      totalMembers,
      solde: updatedSolde,
      statusclub: updateStatus,
     
    };
    console.log('Existing solde:', existingDoc.solde);
    console.log('New solde:', updatedDoc.solde);
    console.log('Update status:', updateStatus);
        if (image instanceof Blob) {
      const reader = new FileReader();
      reader.onload = async function (event) {
        const base64Image = event.target.result;
        updatedDoc.image = base64Image;

        await localDB.put(updatedDoc);

        fetchData();
        handleEditClose();
        setId('');
        setIdentifiant('');
        setNomClub('');
        setTelephone('');
        setTotalMembers('');
        setSolde('');
        setImage(null);

        return true;
      };
      reader.readAsDataURL(image);
    } else {
      // Si l'image ne change pas, mettre à jour sans la modifier
      await localDB.put(updatedDoc);

      fetchData();
      handleEditClose();
      setId('');
      setIdentifiant('');
      setNomClub('');
      setTotalMembers('');
      setSolde('');
      setImage(null);

      return true;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour dans PouchDB :', error);
    return false;
  }
};


  //DELETE Club
  const deleteClub = async (idToDelete) => {
    try {
      const existingDoc = await localDB.get(idToDelete);
  
      // Supprimer le document en utilisant l'objet document
      await localDB.remove(existingDoc);
  
      setClub((prevClubs) => prevClubs.filter((item) => item._id !== idToDelete));
      handleDelClose();
  
      fetchData(); // Rafraîchir les données après la suppression
  
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression dans PouchDB :', error);
      return false;
    }
  };


//Change solde chaque annee
  const updateClubBalances = async () => {
    try {
      const result = await localDB.allDocs({ include_docs: true });
  
      const updatedClubs = result.rows.map(async (row) => {
        const club = row.doc;
  
        const creationDate = new Date(club.datecreation);
        const currentDate = new Date();
        const oneYearInMilliseconds = 31536000000; // Nombre de millisecondes en une année
  
        if (currentDate - creationDate >= oneYearInMilliseconds) {
          // Mettre à jour le solde en soustrayant 50
          club.solde -= 50;
  
          // Mise à jour dans la base locale (PouchDB)
          await localDB.put(club);
  
          return club;
        }
  
        return null;
      });
  
      // Attendre que toutes les mises à jour soient terminées
      await Promise.all(updatedClubs);
  
      console.log('Solde des clubs mis à jour avec succès.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des soldes des clubs :', error);
    }
  };
  




  
//PRINT DATA 

const ListClubPDF = () => {
  const doc = new jsPDF();

  // Ajouter des styles personnalisés
  doc.setFontSize(20);
  doc.setTextColor(0, 128, 0); // Couleur du texte : vert
  doc.setFont('bold'); // Texte en gras
  doc.text('Liste des Utilisateurs', 20, 20);

  const tableData = club.map((club, index) => [
    index + 1,
    { content: club.nomclub, styles: 'cellStyle' }, // Appliquer un style de cellule personnalisé
    club.telephone,
    club.totalMembers,
    club.solde,
    club.statusclub,
    { image: club.image, width: 20, height: 20 }, // Adding the image as an object
  ]);
  const tableHeaders = ['#', 'Nom du club', 'Nombre du membres', 'Solde','Status', 'Photo']; // Add 'Photo' to headers

  // Ajouter un style personnalisé pour les cellules
  const styles = { overflow: 'linebreak' };
  const columnStyles = {
    1: { cellWidth: 'auto', textColor: [255, 0, 0] }, // Style personnalisé pour la cellule du nom
    4: { cellWidth: 20 }, // Largeur de colonne fixe pour les images
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
    filename: 'ListeUtilisateurs.pdf',
    callback: () => {
      // Afficher une alerte après le téléchargement
      window.alert('Téléchargement réussi : ListeUtilisateurs.pdf');
    },
  });
  
  doc.save('ListeUtilisateurs.pdf');
};


//SEARCH
const filteredClubs = club.filter(club => {
  const clubName = `${club.nomclub}`.toLowerCase();
  return clubName.includes(searchTerm.toLowerCase());
});

//TRIE
const sortedAndFilteredClubs = [...filteredClubs].sort((a, b) => {
  if (sortOption === "nom") {
    // Vérification si la propriété nomclub est définie sur les objets a et b
    if (a.nomclub && b.nomclub) {
      return a.nomclub.localeCompare(b.nomclub);
    } else {
      // Si l'une des propriétés nomclub est undefined, traiter les objets comme égaux
      return 0;
    }
  } else if (sortOption === "solde") {
    return a.solde - b.solde;
  }
  return 0;
});

  //modal SHOW
    const [Addshow, setAddShow] = useState(false);


  const handleAddClose = () => {
   
    setIdentifiant('');
    setNomClub('');
    setTelephone('');
    setTotalMembers('');
    setSolde('');
    setImage(null);

    setAddShow(false);
  };
  const handleAddShow = () => setAddShow(true);
//modal EDIT
  const [Editshow, setEditShow] = useState(false);
  const handleEditClose = () => setEditShow(false);

  


    
  //modal DELETE
  const [Delshow, setDelShow] = useState(false);
  const handleDelClose = () => setDelShow(false);
 
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page

  //Pagination
  const clubsPerPage = 2; // Nombre d'utilisateurs par page
  const indexOfLastClub = currentPage * rowsPerPage;
  const indexOfFirstClub = indexOfLastClub - rowsPerPage;
  const currentClubs = sortedAndFilteredClubs.slice(indexOfFirstClub, indexOfLastClub);
  

const handleRowsPerPageChange = value => {
  setRowsPerPage(value);
  setCurrentPage(1); // Reset to the first page when changing rows per page
};




  return (
    <div className='headclub'>
      <SideBar/>
      
      <div className='clubcontainer'>
        <h2 className='title-club'>Liste des clubs</h2>
        {/*Recherche*/}
        <div className='searchclub-container'>
                <SearchIcon className='searchclub-icon' />
                <input
                  type="text"
                  placeholder="Rechercher"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='searchclub'
                />
              </div>
      <div className='headbtnclub'>
    <Button style={{backgroundColor:'#4169E1'}} className='mb-3' onClick={handleAddShow}>Ajouter</Button>
   
      <Tooltip title="Télécharger">
     <DownloadForOfflineIcon onClick={ListClubPDF} sx={{ fontSize: 40,color: 'gray',cursor: 'pointer' }} />
     </Tooltip>


    {/*Trie*/}
      <div className="sort-options">
  <label>Trier par :</label>
  <select
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
  >
    <option value="nom">Nom</option>
    <option value="solde">Solde</option>
  </select>
</div>

</div>
<div className='tablecontient'>
    {sortedAndFilteredClubs ? (
  <Table striped bordered hover>
    <thead>
      <tr>
        <th>#</th>
        <th>Identifiant</th>
        <th>Nom du club</th>
        <th>Téléphone</th>
        <th>Nombres du membres</th>
        <th>Date création</th>
        <th>Solde</th>
        <th>Status</th>
        <th>Photo</th>
        
        <th>Détails</th>
      </tr>
    </thead>
    <tbody>
      {currentClubs.map((doc, index) => (
        
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{doc.identifiant}</td>
          <td>
          <div className='caseDetails'>
            {doc.nomclub}
           {doc.totalUnregisteredMembers > 0 && (
        <div className="alert-icon-container">
          <Tooltip title="Il y a membre(s) non inscrit">
          <NotificationImportantIcon sx={{color:"crimson"}}/>
          </Tooltip>
        </div>
      )}
      </div>
      
      </td>
       <td>{doc.telephone}</td>
          <td>{doc.totalMembers}</td>
          <td>{doc.datecreation}</td>
          <td>{doc.solde}</td>
          <td>
          {doc.statusclub === 'actif' ? (
  <div style={{ backgroundColor: "#6fb551", borderColor: '#6fb551' }} className='btnstatusclub'>
    Actif
  </div>
) : (
  <div style={{ backgroundColor: "#ea5252", borderColor: "#ea5252" }} className='btnstatusclub'>
    Non Actif
  </div>
)}

            </td>
          <td>
            <img
              src={doc.image}
              alt=""
              style={{ maxWidth: '50px', maxHeight: '50px' }}
            />
          </td>
          
          <td >

          <Dropdown>
  <Dropdown.Toggle variant="link" id="dropdown-basic" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }} className="custom-dropdown-toggle">
    <ListIcon sx={{color:'gray'}}/>
   
  </Dropdown.Toggle>

  <Dropdown.Menu>
    <Dropdown.Item onClick={() => navigate(`/club/${doc._id}/detailsclub`)}><SettingsIcon sx={{color:'gray'}}/>Détails du club</Dropdown.Item>
    <Dropdown.Item onClick={() => navigate(`/club/${doc._id}/Accueilclub`)}><Groups2Icon sx={{color:'gray'}}/> Membres du club </Dropdown.Item>
    <Dropdown.Item onClick={() => handleEditShow(doc._id)}><EditIcon sx={{color:'gray'}}/>Modifier</Dropdown.Item>
    <Dropdown.Item onClick={() => handleDelShow(doc._id)}><DeleteIcon sx={{color:'gray'}}/>Supprimer</Dropdown.Item>
    <Dropdown.Item onClick={() => navigate(`/club/${doc._id}/historiquepaiement`)}><ManageSearchIcon sx={{color:'gray'}}/>Historique du paiement</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>

          
          </td>
        </tr>
        
      ))}
    </tbody>
    
  </Table>
) : (
  <Alert variant='light'>
       Aucun club trouvé ...
      </Alert>
)}
</div>
    {/* Pagination */}
    <div className='pagination'>
    <AntdPagination
  current={currentPage}
  pageSize={rowsPerPage}
  total={sortedAndFilteredClubs.length}
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
          </div>
          
{/*PopupModifier*/}
  
      <Modal show={Editshow} onHide={handleEditClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier Club</Modal.Title>
        </Modal.Header>
        <Modal.Body>
    <Form>
      <Form.Group id="form">
        <Form.Label>Nom du club</Form.Label>
        <Form.Control type="text"
        name="nom"
        value={nomclub}
          onChange={ (e) =>{ setNomClub(e.target.value)}}
         />
        
      </Form.Group>

      

      <Form.Group  id="form">
       <Form.Label>Solde</Form.Label>
       <Form.Control type="text" 
       name="solde"
       value={solde}
       onChange={ (e) =>{ setSolde(e.target.value)}}
        />
       </Form.Group>
       <Form.Group controlId="telephone">
  <Form.Label>Numéro de téléphone</Form.Label>
  <Form.Control
    type="text"
    placeholder="Entrer le numéro de téléphone"
    name="telephone"
    value={telephone}
    onChange={(e) => setTelephone(e.target.value)}
  />
</Form.Group>


       <Form.Group id="image">
      <Form.Label>Photo</Form.Label>
       <Form.Control 
       type="file" 
       name="image"
       onChange={ (e) =>{ setImage(e.target.files[0])}}
       />
      </Form.Group>

      
    </Form>
    </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditClose}>
            Fermer
          </Button>
          <Button style={{backgroundColor:'#4169E1'}} onClick={updateClub} >
            Modifier
          </Button>
        </Modal.Footer>
      </Modal>


{/*Popup Ajout*/}
<Modal show={Addshow} onHide={handleAddClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter Club</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {isDuplicate && (
      <div className="alert-message">
        <p>Identifiant existe déjà</p>
      </div>
    )}
        <Form id="form">
        <Form.Group controlId="idclub">
        <Form.Label>Identifiant</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer l'identifiant"
          name="idclub"
          value={identifiant}
          onChange={ (e) =>{ setIdentifiant(e.target.value)}}
        />
      </Form.Group>

      <Form.Group controlId="nom">
        <Form.Label>Nom du club</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer le nom du club"
          name="nom"
          value={nomclub}
          onChange={ (e) =>{ setNomClub(e.target.value)}}
        />
      </Form.Group>
      <Form.Group controlId="telephone">
  <Form.Label>Numéro de téléphone</Form.Label>
  <Form.Control
    type="text"
    placeholder="Entrer le numéro de téléphone"
    name="telephone"
    value={telephone}
    onChange={(e) => setTelephone(e.target.value)}
  />
</Form.Group>

      <Form.Group controlId="image">
        <Form.Label>Photo</Form.Label>
        <Form.Control
          type="file"
          name="image"
          accept="image/*" 
          onChange={(e) => setImage(e.target.files[0])}
        />
      </Form.Group>

    </Form>
    </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleAddClose}>
            Fermer
          </Button>
          <Button style={{backgroundColor:'#4169E1'}} onClick={AddClub}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

{/*Popup supprimer*/}
<Modal show={Delshow} onHide={handleDelClose}>
  <Modal.Header closeButton>
    <Modal.Title>Suppression</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleDelClose}>
      Annuler
    </Button>
    <Button variant="danger" onClick={() => deleteClub(id)}>
      Confirmer
    </Button>
  </Modal.Footer>
</Modal>


   
   </div>

);
}
export default ListerClub;