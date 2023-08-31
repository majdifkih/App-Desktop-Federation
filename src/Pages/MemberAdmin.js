import {Table, Form, Modal, Button, Alert,Dropdown } from 'react-bootstrap';
import { Pagination as AntdPagination,Select  } from 'antd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import ListIcon from '@mui/icons-material/List';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Person2Icon from '@mui/icons-material/Person2';
import jsPDF from 'jspdf';
import './MemberAdmin.css';
import { useEffect, useState } from 'react';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Link, useLocation, useParams,useNavigate} from 'react-router-dom';
import SideBar from '../Components/SideBar';
PouchDB.plugin(PouchDBFind);
const localDB = new PouchDB('MembreAdminDB');
const clubDB= new PouchDB('club_db');
const { Option } = Select;

const MemberAdmin = () => {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const memberId = queryParams.get('clubId');
  const [membadmin, setMembadmin] = useState([]);
    const [id , setId] = useState('')
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [role, setRole] = useState("");
    const [tel, setTelephone] = useState("");
    const [fax, setFax] = useState("");
    const [sexe, setSexe] = useState("");
    const [status, setStatus] = useState("Inscrit");
  
    const [numFemmes, setNumFemmes] = useState(0);
    const [numHommes, setNumHommes] = useState(0);
    const [numNonInscrits, setNumNonInscrits] = useState(0);
    const [numInscrits, setNumInscrits] = useState(0);
    const [alertMessage, setAlertMessage] = useState(null);


      useEffect(() => {
        fetchData();
      }, [clubId]);
    
      const fetchData = async () => {
        try {
          const result = await localDB.allDocs({ include_docs: true });
          const currentTime = new Date();
          const updatedMembadmins = result.rows
            .map(row => row.doc)
            .filter(membadmin => membadmin.clubId === clubId) // Filtrer les membres par ID utilisateur
            .map(membadmin => {
              const registrationDate = new Date(membadmin.dateInscription); // Changer le champ avec le champ de la date d'inscription réel
              const timeDiff = currentTime - registrationDate;
              const daysDiff = timeDiff / (1000 * 3600 * 24);
              if (membadmin.status === 'inscrit' && daysDiff >= 365) {
                membadmin.status = 'non inscrit';
              }
              return membadmin;
            });
             // Calculer les statistiques
    const Femmes = updatedMembadmins.filter(membadmin => membadmin.sexe === 'Femme').length;
    const Hommes = updatedMembadmins.filter(membadmin => membadmin.sexe === 'Homme').length;
    
    setNumFemmes(Femmes);
    setNumHommes(Hommes);
    
    
          setMembadmin(updatedMembadmins);
        } catch (error) {
          console.error('Erreur lors de la récupération des données :', error);
        }
      };
      
      
    //   localDB.destroy()
    //   .then(() => {
    //     console.log(`La base de données ${"MembreDB"} a été supprimée avec succès.`);
    //   })
    //   .catch(error => {
    //     console.error(`Erreur lors de la suppression de la base de données : ${error}`);
    //   });



    const AddMembadmin = async () => {
      // Générer un nouvel identifiant unique
      const _id = uuidv4();
    
      try {
        // Récupérer le document du club en utilisant clubId
        const clubDoc = await clubDB.get(clubId);
    
        // Vérifier si le solde est supérieur à 10
        if (clubDoc.solde > 10) {
          // Créer un nouvel objet membre avec les données
          const newMembadmin = {
            _id,
            clubId,
            nom,
            sexe,
            prenom,
            role,
            tel,
            fax,
            status: 'inscrit'
          };
    
          // Insérer le nouveau document dans la base locale (PouchDB)
          await localDB.put(newMembadmin);
    
          // Déduire 10 du solde du club
          const updatedClubDoc = {
            ...clubDoc,
            solde: clubDoc.solde - 10
          };
    
          // Mettre à jour le document du club dans la base de données
          await clubDB.put(updatedClubDoc);
    
          fetchData();
          handleAddClose();
    
          // Reste de votre logique
    
        } else {
          // Afficher une alerte "sold out" si le solde n'est pas suffisant
          setAlertMessage("Solde insuffisant: au moins 10 sont requis");
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout du membre localement :", error);
      }
    };
    


      // UPDATE Membadmin
      const updateMembadmin = async (id, updates) => {
       
          const existingDoc = await localDB.get(id);
      
          const updatedDoc = {
            ...existingDoc,
            ...updates,
          };
      
              try {
                // Mise à jour dans la base locale (PouchDB)
                await localDB.put(updatedDoc);
      
                fetchData(); // Rafraîchir les données après la mise à jour
                handleEditClose(); // Fermer la fenêtre modale
                // Réinitialiser les valeurs après la mise à jour
                setNom('');
                setSexe('');
                setPrenom('');
                setTelephone('');
                setRole('');
                setFax('');
      
                return true;
              } catch (serverError) {
                console.error('Erreur lors de la mise à jour :', serverError);
                return false;
              }
            }
       
      
  
  // DELETE Membadmin
  const deleteMembadmin = async (idToDelete) => {
    try {
      const existingDoc = await localDB.get(idToDelete);
  
        // Supprimer le document en utilisant son _id et _rev
        await localDB.remove(existingDoc._id, existingDoc._rev);
  
        setMembadmin((prevMembadmins) => prevMembadmins.filter((item) => item._id !== idToDelete));
        handleDelClose();
       
        fetchData(); // Rafraîchir les données après la suppression
  
        // Fermer le modal de suppression ici
        handleDelClose();
  
    } catch (error) {
      console.error('Erreur lors de la suppression dans PouchDB :', error);
      return false;
    }
  };


  const handleStatusChange = async (newStatus, membadminId) => {
    try {
      // Récupérer le membre correspondant à l'ID
      const membadminToUpdate = membadmin.find(m => m._id === membadminId);
  
      // Vérifier si le nouveau statut est "non inscrit" et l'ancien statut n'était pas "non inscrit"
      if (newStatus === "inscrit" && membadminToUpdate.status !== "inscrit") {
        // Récupérer le document du club en utilisant clubId
        const clubDoc = await clubDB.get(clubId);
  
        // Vérifier si le solde est supérieur ou égal à 10
        if (clubDoc.solde >= 10) {
          // Déduire 10 du solde du club
          clubDoc.solde -= 10;
  
          // Mettre à jour le document du club dans la base de données "club_db"
          await clubDB.put(clubDoc);
        } else {
          // Afficher un message d'erreur si le solde est insuffisant
          message.error("Solde insuffisant : au moins 10 sont requis");
          return;
        }
      }
  
      // Créer un nouvel objet de membre avec le nouveau statut et les autres données inchangées
      const updatedMembadmin = {
        ...membadminToUpdate,
        status: newStatus
      };
  
      // Mettre à jour le membre dans la base de données locale (PouchDB)
      await localDB.put(updatedMembadmin);
  
      // Mettre à jour l'état local avec le membre mis à jour
      setMembadmin(prevMembadmins =>
        prevMembadmins.map(m => (m._id === membadminId ? updatedMembadmin : m))
      );
  
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
  };
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState("nomPrenom"); // Par défaut, tri par nom
    const [currentPage, setCurrentPage] = useState(1);

    const handleEditShow = (id) =>{
   
        membadmin.forEach ( c =>{
         if (c._id == id){
              setId(c._id);
              setNom(c.nom);
                setSexe(c.sexe);
                setPrenom(c.prenom);
                setTelephone(c.tel);
                setRole(c.role);
                setFax(c.fax);
           console.log(c)
         }
        })
        setEditShow(true);}
      
      
        const handleDelShow = (iddel) =>{
         
          membadmin.forEach ( c =>{
           if (c._id == iddel){
                setId(c._id);
               
             console.log(c)
           }
          })
          setDelShow(true);}

//SEARCH
const filteredMembres = membadmin.filter(membadmin => {
    const fullName = `${membadmin.nom}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });
  
  //TRIE
  const sortedAndFilteredMembres = [...filteredMembres].sort((a, b) => {
    if (sortOption === "nomPrenom") {
      return (a.nom || "").localeCompare(b.nom || "");
    } else if (sortOption === "categories") {
      return (a.categories || "").localeCompare(b.categories || "");
    } else if (sortOption === "club") {
      return (a.nomClub || "").localeCompare(b.nomClub || "");
    }
    return 0;
  });

  


  //modal SHOW
  const [Addshow, setAddShow] = useState(false);

 

 const handleAddClose = () => {
  setNom('');
  setSexe('');
  setPrenom('');
  setTelephone('');
  setRole('');
  setFax('');
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
  const membadminsPerPage = 2; // Nombre d'utilisateurs par page
  const indexOfLastMembadmin = currentPage * rowsPerPage;
  const indexOfFirstMembadmin = indexOfLastMembadmin - rowsPerPage;
  const currentMembadmins = sortedAndFilteredMembres.slice(indexOfFirstMembadmin, indexOfLastMembadmin);
  

const handleRowsPerPageChange = value => {
  setRowsPerPage(value);
  setCurrentPage(1); // Reset to the first page when changing rows per page
};

//PRINT DATA 


  
    return(
        <div className='meberadmin-contient'>
            <SideBar/>
            <div className='membadminmain'>
            <div className="backbtn-accueil" onClick={() => navigate(-1)}>
          <ArrowBackIcon  /> Accueil du club
        </div> 
        <h2 className='title-joueur-total'>Liste des membres administratifs</h2>
            <div className='cardstatadmin'>
  <div className='cardcontadmin'>
    <div>
      Membres femme:<br/><br/> <center> {numFemmes}</center>
    </div>
    {/* Afficher le nombre de joueurs féminins ici */}
  </div>
  <div className='cardcontadmin'>
    <div>
    Membres homme:<br/><br/> <center>{numHommes}</center>
    </div>
    {/* Afficher le nombre de joueurs masculins ici */}
  </div>
 
</div>

            <div className='containermembadmin'>
              <div className='btnsadmin'>
 <Button style={{backgroundColor:'#4169E1'}} className='mb-3' onClick={handleAddShow}>Ajouter</Button>


{/*Recherche*/}
<div className='searchadmin-contient'>
<SearchIcon className='searchmemberadmin-icon' />
      <input
        type="text"
        placeholder="Rechercher"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className='searchmemberadmin'
      />
</div>

             
</div>


 {sortedAndFilteredMembres ? (
 <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Sexe</th>
            <th>Téléphone</th>
            <th>Fax</th>
            <th>Rôle</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentMembadmins.map((membadmin, index) => (
            <tr key={membadmin._id}>
              <td>{index + 1}</td>
              <td>{membadmin.nom}</td>
              <td>{membadmin.prenom}</td>
              <td>{membadmin.sexe}</td>
              <td>{membadmin.tel}</td>
              <td>{membadmin.fax}</td>
              <td>{membadmin.role}</td>
              
        <td>
  {membadmin.status === 'inscrit' ? (
    <Button
    style={{backgroundColor:"#6fb551",borderColor: '#6fb551'}}
      onClick={() => handleStatusChange('non inscrit', membadmin._id)}
      className='btnstatusadmin'
   >
      Inscrit
    </Button>
  ) : (
    <Button
    style={{ backgroundColor: "#ea5252", borderColor: "#ea5252" }}
      onClick={() => handleStatusChange('inscrit', membadmin._id)}
    className='btnstatusadmin'
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
    <Dropdown.Item onClick={() => navigate(`/memberadmin/${membadmin._id}`)}><Person2Icon sx={{color:'gray'}}/>Profil de joueur </Dropdown.Item>
    <Dropdown.Item onClick={() => handleEditShow(membadmin._id)}><EditIcon sx={{color:'gray'}}/>Modifier</Dropdown.Item>
    <Dropdown.Item onClick={() => handleDelShow(membadmin._id)}><DeleteIcon sx={{color:'gray'}}/>
Supprimer</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>
    </td>
  
              
            </tr>
          ))}
        </tbody>
      </Table>
      ) : (
        <Alert variant='light'>
        This is a alert—check it out!
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

     {/*PopupModifier*/}
 
     <Modal show={Editshow} onHide={handleEditClose}>
  <Modal.Header closeButton>
    <Modal.Title>Modifier Membre</Modal.Title>
  </Modal.Header>
  <Modal.Body>
  <Form id="form" className="add-membadmin-form">
        
        <Form.Group controlId="nom" >
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer le nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="prenom">
            <Form.Label>Prénom</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer le Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </Form.Group>
    
          <Form.Group controlId="sexe">
            <Form.Label>Sexe</Form.Label>
            <div className='check-sexe-cas'>
              <Form.Check
                type="radio"
                label="Homme"
                name="sexe"
                value="Homme"
                checked={sexe === 'Homme'}
                onChange={(e) => setSexe(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Femme"
                name="sexe"
                value="Femme"
                checked={sexe === 'Femme'}
                onChange={(e) => setSexe(e.target.value)}
              />
            </div>
          </Form.Group>
    
          
    
          <Form.Group controlId="tel">
            <Form.Label>Téléphone</Form.Label>
            <Form.Control
              type="number"
              placeholder='Entrer telephone'
              value={tel}
              onChange={(e) => setTelephone(e.target.value)}
            />
          </Form.Group>
    
          <Form.Group controlId="fax">
            <Form.Label>Fax</Form.Label>
            <Form.Control
              type="number"
              placeholder='Entrer fax'
              value={fax}
              onChange={(e) => setFax(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="role">
            <Form.Label>Rôle</Form.Label>
            <Form.Control
             className='form-control-role'
              as="select"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Sélectionnez un rôle</option>
              <option value="Président">Président </option>
              <option value="Vice-Président">Vice-Président </option>
              <option value="secrétaire générale">secrétaire générale </option>
              <option value="Responsable financaire">Responsable financier</option>
              <option value="Président de branche">Président de branche </option>
              <option value="Directeur technique">Directeur technique</option>
              <option value="Entraineur">Entraineur</option>
              <option value="Responsable des relations">Responsable des relations avec la federation</option>
            </Form.Control>
          </Form.Group>
        </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleEditClose}>
      Fermer
    </Button>
    <Button
  style={{backgroundColor:'#4169E1'}}
  onClick={() => updateMembadmin(id, {
    nom,
    sexe,
    prenom,
    tel,
    fax,
    role
  })}
>
  Modifier
</Button>
  </Modal.Footer>
</Modal>




{/*Popup Ajout*/}
<Modal show={Addshow} onHide={handleAddClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter Membre</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {alertMessage && (
      <div className="custom-alert">
        {alertMessage}
      </div>
    )}
          <Form id="form" className="add-membadmin-form">
        
    <Form.Group controlId="nom" >
        <Form.Label>Nom</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer le nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="prenom">
        <Form.Label>Prénom</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer le Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="sexe">
        <Form.Label>Sexe</Form.Label>
        <div className='check-sexe-cas'>
          <Form.Check
            type="radio"
            label="Homme"
            name="sexe"
            value="Homme"
            checked={sexe === 'Homme'}
            onChange={(e) => setSexe(e.target.value)}
          />
          <Form.Check
            type="radio"
            label="Femme"
            name="sexe"
            value="Femme"
            checked={sexe === 'Femme'}
            onChange={(e) => setSexe(e.target.value)}
          />
        </div>
      </Form.Group>

      

      <Form.Group controlId="tel">
        <Form.Label>Téléphone</Form.Label>
        <Form.Control
          type="number"
          placeholder='Entrer telephone'
          value={tel}
          onChange={(e) => setTelephone(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="fax">
        <Form.Label>Fax</Form.Label>
        <Form.Control
          type="number"
          placeholder='Entrer fax'
          value={fax}
          onChange={(e) => setFax(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="role">
        <Form.Label>Rôle</Form.Label>
        <Form.Control
         className='form-control-role'
          as="select"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Sélectionnez un rôle</option>
          <option value="Président">Président </option>
          <option value="Vice-Président">Vice-Président </option>
          <option value="secrétaire générale">secrétaire générale </option>
          <option value="Responsable financaire">Responsable financier</option>
          <option value="Président de branche">Président de branche </option>
          <option value="Directeur technique">Directeur technique</option>
          <option value="Entraineur">Entraineur</option>
          <option value="Responsable des relations">Responsable des relations avec la federation</option>
        </Form.Control>
      </Form.Group>
    </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleAddClose}>
            Fermer
          </Button>
          <Button style={{backgroundColor:'#4169E1'}} onClick={AddMembadmin}>
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
    <p>Êtes-vous sûr de vouloir la suppression ?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleDelClose}>
      Annuler
    </Button>
    <Button variant="danger" onClick={() => deleteMembadmin(id)}>
      Confirmer
    </Button>
  </Modal.Footer>
</Modal>
</div>
</div>
</div>
    )
}
export default MemberAdmin;