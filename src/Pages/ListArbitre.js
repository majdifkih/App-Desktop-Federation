import {Table, Form, Modal, Button, Alert,Dropdown, Row, Col } from 'react-bootstrap';
import { Pagination as AntdPagination,Select  } from 'antd';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import ListIcon from '@mui/icons-material/List';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Person2Icon from '@mui/icons-material/Person2';
import jsPDF from 'jspdf';
import { v4 as uuidv4 } from 'uuid';
import 'jspdf-autotable';
import { useEffect, useState } from 'react';
import './ListArbitre.css';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Link,useNavigate } from 'react-router-dom';
import SideBar from '../Components/SideBar';
PouchDB.plugin(PouchDBFind);
const localDB = new PouchDB('arbitre_db');
const { Option } = Select;








const ListArbitre = () => {



  const navigate = useNavigate();
    const [arbitre, setArbitre] = useState([]);
  const [id , setId] = useState('')
  const [nomPrenom , setNomPrenom] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [cin, setCin] = useState('')
  const [sexe, setSexe] = useState('')
  const [dateCreationCIN, setDateCreationCIN] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [adresse, setAdresse] = useState('')
  const [profession, setProfession] = useState('')
  const [diplome, setDiplome] = useState('')
  const [image, setImage] = useState('')
  const [status, setStatus] = useState('inscrit')

 
 
  const [searchTerm, setSearchTerm] = useState('');
  const [groupOption, setGroupOption] = useState("nom"); // Par défaut, tri par nom
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  
  const fetchData = async () => {
    try {
      const result = await localDB.allDocs({ include_docs: true });
      const currentTime = new Date();
      const updatedArbitres = result.rows
        .map(row => row.doc)
        .map(arbitre => {
          const registrationDate = new Date(arbitre.dateInscription); // Changer le champ avec le champ de la date d'inscription réel
          const timeDiff = currentTime - registrationDate;
          const daysDiff = timeDiff / (1000 * 3600 * 24);
          if (arbitre.status === 'inscrit' && daysDiff >= 365) {
            arbitre.status = 'non inscrit';
          }
          return arbitre;
        });
      setArbitre(updatedArbitres);
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };


  //ADD Arbitre
// ...

const AddArbitre = async (e) => {
  e.preventDefault();
  try {
    const _id = uuidv4();

    let base64Image = null; // Initialiser base64Image à null

    if (image) {
      // Convertir l'image Blob en base64 seulement si une image est fournie
      const reader = new FileReader();
      reader.onload = function (event) {
        base64Image = event.target.result;

        // Appel à votre logique d'ajout d'arbitre
        addArbitreWithData(_id, base64Image);
      };

      reader.readAsDataURL(image);
    } else {
      // Appel à votre logique d'ajout d'arbitre sans image
      addArbitreWithData(_id, base64Image);
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'arbitre :', error);
  }
};

const addArbitreWithData = async (_id, base64Image) => {
  try {
    const newArbitre = {
      _id,
      nomPrenom,
      dateNaissance,
      cin,
      sexe,
      dateCreationCIN,
      telephone,
      email,
      adresse,
      profession,
      diplome,
      image: base64Image, // Utilisez la valeur de base64Image ici (peut être null)
      status: 'inscrit'
    };

    // Insérer le nouveau document dans la base locale (PouchDB)
    await localDB.put(newArbitre);

    // Réinitialiser les valeurs et rafraîchir les données
    handleAddClose();
    setNomPrenom('');
    setDateNaissance('');
    setCin('');
    setSexe('');
    setDateCreationCIN('');
    setTelephone('');
    setEmail('');
    setProfession('');
    setAdresse('');
    setDiplome('');
    setImage(null);
    fetchData();
  } catch (localDbError) {
    console.error('Erreur lors de l\'ajout de l\'arbitre localement :', localDbError);
    // Gérer les erreurs d'ajout localement
  }
};

// ...


  

  
  
const handleEditShow = (id) =>{
   
  arbitre.forEach ( c =>{
   if (c._id == id){
    setId(c._id)
    setNomPrenom(c.nomPrenom);
    setDateNaissance(c.dateNaissance);
    setCin(c.cin);
    setSexe(c.sexe);
    setDateCreationCIN(c.dateCreationCIN);
    setTelephone(c.telephone);
    setEmail(c.email);
    setProfession(c.profession);
    setAdresse(c.adresse);
    setDiplome(c.diplome);
    setImage(c.image);
     console.log(c)
   }
  })
  setEditShow(true);}


  const handleDelShow = (iddel) =>{
   
    arbitre.forEach ( c =>{
     if (c._id == iddel){
          setId(c._id);
         
       console.log(c)
     }
    })
    setDelShow(true);}


//Update Arbitre

  const updateArbitre = async (id, updates, image) => {
    try {
      const existingDoc = await localDB.get(id);
  
      const updatedDoc = {
        ...existingDoc,
        ...updates,
        image: existingDoc.image // Conserver l'image existante par défaut
      };
  
      if (image instanceof Blob) {
        // Convertir l'image Blob en base64
        const reader = new FileReader();
        reader.onload = async function (event) {
          const base64Image = event.target.result;
          updatedDoc.image = base64Image;
  
          try {
            // Mise à jour dans la base locale (PouchDB)
            await localDB.put(updatedDoc);
  
            fetchData(); // Rafraîchir les données après la mise à jour
            handleEditClose(); // Fermer la fenêtre modale
            // Réinitialiser les valeurs après la mise à jour
            setNomPrenom('');
            setDateNaissance('');
            setCin('');
            setSexe('');
            setDateCreationCIN('');
            setTelephone('');
            setEmail('');
            setProfession('');
            setAdresse('');
            setDiplome('');
            setImage(null);
  
            return true;
          } catch (serverError) {
            console.error('Erreur lors de la mise à jour :', serverError);
            return false;
          }
        };
        reader.readAsDataURL(image);
      } else {
        // Mise à jour sans image
        await localDB.put(updatedDoc);
  
        fetchData(); // Rafraîchir les données après la mise à jour
        handleEditClose(); // Fermer la fenêtre modale
        // Réinitialiser les valeurs après la mise à jour
            setNomPrenom('');
            setDateNaissance('');
            setCin('');
            setSexe('');
            setDateCreationCIN('');
            setTelephone('');
            setEmail('');
            setProfession('');
            setAdresse('');
            setDiplome('');
            setImage(null);
  
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du document :', error);
      return false;
    }
  };








    //DELETE Arbitre
  const deleteArbitre = async (idToDelete) => {
    try {
      const existingDoc = await localDB.get(idToDelete);
  
      
        // Supprimer le document en utilisant son _id et _rev
      await localDB.remove(existingDoc._id, existingDoc._rev);
  
      setArbitre((prevArbitres) => prevArbitres.filter((item) => item._id !== idToDelete));
      handleDelClose();
        
        fetchData(); // Rafraîchir les données après la suppression
  
        // Fermer le modal de suppression ici
        handleDelClose();
  
      
    } catch (error) {
      console.error('Erreur lors de la suppression dans PouchDB :', error);
      return false;
    }
  };


  //CHANGE Status
  const handleStatusChange = async (newStatus, arbitreId) => {
  try {
    // Récupérer l'arbitre correspondant à l'ID
    const arbitreToUpdate = arbitre.find(m => m._id === arbitreId);

    // Créer un nouvel objet d'arbitre avec le nouveau statut et les autres données inchangées
    const updatedArbitre = {
      ...arbitreToUpdate,
      _id: arbitreId,
      status: newStatus
    };

    // Mettre à jour l'arbitre dans la base de données locale (PouchDB)
    await localDB.put(updatedArbitre);

    // Mettre à jour le tableau local avec le nouvel arbitre mis à jour
    const updatedArbitres = arbitre.map(m => (m._id === arbitreId ? updatedArbitre : m));
    setArbitre(updatedArbitres);
    fetchData();
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
  }
};

  

//SEARCH
const filteredArbitres = arbitre.filter(arbitre => {
    const fullName = `${arbitre.nomPrenom}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });


    //Grouped
const GroupedAndFilteredArbitres = [...filteredArbitres].sort((a, b) => {
  if (groupOption === "nom") {
    return a.nomPrenom.localeCompare(b.nomPrenom);
  } else if (groupOption === "diplome") {
    return a.diplome.localeCompare(b.diplome);
  }
  });

//modal SHOW
const [Addshow, setAddShow] = useState(false);



const handleAddClose = () => {
  setNomPrenom('');
  setDateNaissance('');
  setCin('');
  setSexe('');
  setDateCreationCIN('');
  setTelephone('');
  setEmail('');
  setProfession('');
  setAdresse('');
  setDiplome('');
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
  const arbitresPerPage = 2; // Nombre d'utilisateurs par page
  const indexOfLastArbitre = currentPage * rowsPerPage;
  const indexOfFirstArbitre = indexOfLastArbitre - rowsPerPage;
  const currentArbitres = GroupedAndFilteredArbitres.slice(indexOfFirstArbitre, indexOfLastArbitre);
  

const handleRowsPerPageChange = value => {
  setRowsPerPage(value);
  setCurrentPage(1); // Reset to the first page when changing rows per page
};

    return(
        <div className='arbitrecontient'>
            
      <SideBar/>
      
      <div className='Arbitrecont'>
    
      <h2 className='title-arbitre'>Liste des arbitres</h2>
{/*Recherche*/}
      <div className='searcharbitre-container'>
        
                <SearchIcon className='searcharbitre-icon' />
                <input
                  type="text"
                  placeholder="Rechercher"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='searcharbitre'
                />
              </div>

    
    <div className='headbtnarbitre'>
    <Button style={{backgroundColor:'#4169E1'}} className='mb-3' onClick={handleAddShow}>Ajouter</Button>
    {/* <Button variant="danger" className='mb-3' >sync</Button> */}
    <Tooltip title="Télécharger">
     <DownloadForOfflineIcon  sx={{ fontSize: 40,color: 'gray',cursor: 'pointer' }} />
     </Tooltip>
     {/*Trie*/}
      <div className="sort-options">
  <label>Trier par :</label>
  <select
    value={groupOption}
    onChange={(e) => setGroupOption(e.target.value)}
  >
    <option value="nom">Nom</option>
    <option value="prenom">Diplôme</option>
  </select>
</div>
</div>
    {GroupedAndFilteredArbitres ? (
  <Table striped bordered hover>
    <thead>
      <tr>
        <th>#</th>
        <th>Nom et prénom</th>
        <th>Téléphone</th>
        <th>Diplôme</th>
        <th>Photo</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentArbitres.map((doc, index) => (
        
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{doc.nomPrenom}</td>
          <td>{doc.telephone}</td>
          <td>{doc.diplome}</td>
          <td>
            <img
              src={doc.image}
              alt=""
              style={{ maxWidth: '50px', maxHeight: '50px' }}
            />
          </td>
          <td>
  {doc.status === 'inscrit' ? (
    <Button
    style={{backgroundColor:"#6fb551",borderColor: '#6fb551'}}
      onClick={() => handleStatusChange('non inscrit', doc._id)}
      className='btnstatusArbi'
   >
      Inscrit
    </Button>
  ) : (
    <Button
    style={{ backgroundColor: "#ea5252", borderColor: "#ea5252" }}
      onClick={() => handleStatusChange('inscrit', doc._id)}
    className='btnstatusArbi'
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
    <Dropdown.Item onClick={() => navigate(`/arbitre/${doc._id}`)}><Person2Icon sx={{color:'gray'}}/>Profil de l'arbitre </Dropdown.Item>
    <Dropdown.Item onClick={() => handleEditShow(doc._id)}><EditIcon sx={{color:'gray'}}/>Modifier</Dropdown.Item>
    <Dropdown.Item onClick={() => handleDelShow(doc._id)}><DeleteIcon sx={{color:'gray'}}/>Supprimer</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>

       
    </td>
  
 
        </tr>
        
      ))}
    </tbody>
    
  </Table>
) : (
  <Alert variant='light'>
       Aucun arbitre trouvé ...
      </Alert>
)}
    {/* Pagination */}
    <div className='pagination'>
    <AntdPagination
  current={currentPage}
  pageSize={rowsPerPage}
  total={GroupedAndFilteredArbitres.length}
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
  
      <Modal show={Editshow} onHide={handleEditClose} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Modifier Arbitre</Modal.Title>
        </Modal.Header>
        <Modal.Body>
    <Form>
    <Row className="mb-3">
    <Form.Group as={Col} controlId="NomPrenom">
        <Form.Label>Nom et Prénom</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer le nom et prénom"
          name="NomPrenom"
          value={nomPrenom}
          onChange={(e) => setNomPrenom(e.target.value)}
        />
      </Form.Group>

      <Form.Group as={Col} controlId="DateNaissance">
        <Form.Label>Date de naissance</Form.Label>
        <Form.Control
          type="date"
          name="DateNaissance"
          value={dateNaissance}
          onChange={(e) => setDateNaissance(e.target.value)}
        />
      </Form.Group>
      </Row>
      <Form.Group controlId="Sexe" className="mb-3">
        <Form.Label>Sexe</Form.Label>
        <div className='check-sexe-cas'>
          <Form.Check
            type="radio"
            label="Homme"
            name="sexe"
            value="homme"
            checked={sexe === "homme"}
            onChange={(e) => setSexe(e.target.value)}
          />
          <Form.Check
            type="radio"
            label="Femme"
            name="sexe"
            value="femme"
            checked={sexe === "femme"}
            onChange={(e) => setSexe(e.target.value)}
          />
        </div>
      </Form.Group>
      <Row className="mb-3">
      <Form.Group as={Col} controlId="CIN">
        <Form.Label>Numéro CIN</Form.Label>
        <Form.Control
          type="number"
          placeholder="Entrer le numéro CIN"
          name="CIN"
          value={cin}
          onChange={(e) => setCin(e.target.value)}
        />
      </Form.Group>

      <Form.Group as={Col} controlId="DateCreationCIN">
        <Form.Label>Date de création CIN</Form.Label>
        <Form.Control
          type="date"
          name="DateCreationCIN"
          value={dateCreationCIN}
          onChange={(e) => setDateCreationCIN(e.target.value)}
        />
      </Form.Group>
      </Row>
      <Row className="mb-3">
      <Form.Group as={Col} controlId="Telephone">
        <Form.Label>Téléphone</Form.Label>
        <Form.Control
          type="number"
          placeholder="Entrer le téléphone"
          name="Telephone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />
      </Form.Group>

      <Form.Group as={Col} controlId="Email">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Entrer l'email"
          name="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Group>
      </Row>
      <Row className="mb-3">
      <Form.Group as={Col} controlId="Adresse">
        <Form.Label>Adresse</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer l'adresse"
          name="Adresse"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
        />
      </Form.Group>

      <Form.Group as={Col} controlId="Profession">
        <Form.Label >Profession</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer la profession"
          name="Profession"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
        />
      </Form.Group>
</Row>
<Row className="mb-3">
      <Form.Group as={Col} controlId="Diplome">
        <Form.Label>Diplôme</Form.Label>
        <Form.Control
          as="select"
          name="Diplome"
          value={diplome}
          onChange={(e) => setDiplome(e.target.value)}
        >
          <option value="">Sélectionnez un diplôme</option>
          <option value="juge de ligne">Juge de ligne</option>
          <option value="1er degree">1er degré</option>
          <option value="2eme degree">2ème degré</option>
          <option value="3eme degree">3ème degré</option>
          <option value="Africain">Africain</option>
          <option value="Nationale">Nationale</option>
        </Form.Control>
      </Form.Group>
      </Row>
      <Form.Group as={Col} controlId="image">
        <Form.Label>Photo</Form.Label>
        <Form.Control
          type="file"
          accept='image/*'
          onChange={(e) => setImage(e.target.files[0])}
        />
         
      </Form.Group>

      
    </Form>
    </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditClose}>
            Fermer
          </Button>
          <Button style={{backgroundColor:'#4169E1'}} onClick={() => updateArbitre(id, {
    nomPrenom,
    dateNaissance,
    sexe,
    cin,
    dateCreationCIN,
    telephone,
    adresse,
    profession,
    email,
    diplome
  }, image)}>
            Modifier
          </Button>
        </Modal.Footer>
      </Modal>


{/*Popup Ajout*/}
<Modal show={Addshow} onHide={handleAddClose} size='lg'>
  <Modal.Header closeButton>
    <Modal.Title>Ajouter Arbitre</Modal.Title>
  </Modal.Header>
  <Modal.Body>
  <Form>
    <Row className="mb-3">
    <Form.Group as={Col} controlId="NomPrenom">
        <Form.Label>Nom et Prénom</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer le nom et prénom"
          name="NomPrenom"
          value={nomPrenom}
          onChange={(e) => setNomPrenom(e.target.value)}
        />
      </Form.Group>

      <Form.Group as={Col} controlId="DateNaissance">
        <Form.Label>Date de naissance</Form.Label>
        <Form.Control
          type="date"
          name="DateNaissance"
          value={dateNaissance}
          onChange={(e) => setDateNaissance(e.target.value)}
        />
      </Form.Group>
      </Row>
      <Form.Group controlId="Sexe" className="mb-3">
        <Form.Label>Sexe</Form.Label>
        <div className='check-sexe-cas'>
          <Form.Check
            type="radio"
            label="Homme"
            name="sexe"
            value="homme"
            checked={sexe === "homme"}
            onChange={(e) => setSexe(e.target.value)}
          />
          <Form.Check
            type="radio"
            label="Femme"
            name="sexe"
            value="femme"
            checked={sexe === "femme"}
            onChange={(e) => setSexe(e.target.value)}
          />
        </div>
      </Form.Group>
      <Row className="mb-3">
      <Form.Group as={Col} controlId="CIN">
        <Form.Label>Numéro CIN</Form.Label>
        <Form.Control
          type="number"
          placeholder="Entrer le numéro CIN"
          name="CIN"
          value={cin}
          onChange={(e) => setCin(e.target.value)}
        />
      </Form.Group>

      <Form.Group as={Col} controlId="DateCreationCIN">
        <Form.Label>Date de création CIN</Form.Label>
        <Form.Control
          type="date"
          name="DateCreationCIN"
          value={dateCreationCIN}
          onChange={(e) => setDateCreationCIN(e.target.value)}
        />
      </Form.Group>
      </Row>
      <Row className="mb-3">
      <Form.Group as={Col} controlId="Telephone">
        <Form.Label>Téléphone</Form.Label>
        <Form.Control
          type="number"
          placeholder="Entrer le téléphone"
          name="Telephone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />
      </Form.Group>

      <Form.Group as={Col} controlId="Email">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Entrer l'email"
          name="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Group>
      </Row>
      <Row className="mb-3">
      <Form.Group as={Col} controlId="Adresse">
        <Form.Label>Adresse</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer l'adresse"
          name="Adresse"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
        />
      </Form.Group>

      <Form.Group as={Col} controlId="Profession">
        <Form.Label >Profession</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer la profession"
          name="Profession"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
        />
      </Form.Group>
</Row>
<Row className="mb-3">
      <Form.Group as={Col} controlId="Diplome">
        <Form.Label>Diplôme</Form.Label>
        <Form.Control
          as="select"
          name="Diplome"
          value={diplome}
          onChange={(e) => setDiplome(e.target.value)}
        >
          <option value="">Sélectionnez un diplôme</option>
          <option value="juge de ligne">Juge de ligne</option>
          <option value="1er degree">1er degré</option>
          <option value="2eme degree">2ème degré</option>
          <option value="3eme degree">3ème degré</option>
          <option value="Africain">Africain</option>
          <option value="Nationale">Nationale</option>
        </Form.Control>
      </Form.Group>
      </Row>
      <Form.Group as={Col} controlId="image">
        <Form.Label>Photo</Form.Label>
        <Form.Control
          type="file"
          accept='image/*'
          onChange={(e) => setImage(e.target.files[0])}
        />
         
      </Form.Group>

      
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleAddClose}>
      Fermer
    </Button>
    <Button style={{backgroundColor:'#4169E1'}} onClick={AddArbitre}>
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
    <p>Êtes-vous sûr de vouloir supprimer cet arbitre ?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleDelClose}>
      Annuler
    </Button>
    <Button variant="danger" onClick={() => deleteArbitre(id)}>
      Confirmer
    </Button>
  </Modal.Footer>
</Modal>


   </div>
  
        </div>
    )
}
export default ListArbitre;