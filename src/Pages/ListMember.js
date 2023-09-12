import {Table, Form, Modal, Button, Alert ,Dropdown,Row,Col} from 'react-bootstrap';
import { Pagination as AntdPagination,Select  } from 'antd';
import { message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import ListIcon from '@mui/icons-material/List';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Person2Icon from '@mui/icons-material/Person2';
import jsPDF from 'jspdf';
import './ListMember.css';
import { useEffect, useState } from 'react';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Link, useLocation, useParams,useNavigate} from 'react-router-dom';
import SideBar from '../Components/SideBar';
PouchDB.plugin(PouchDBFind);
const localDB = new PouchDB('MembreDB');
const clubDB= new PouchDB('club_db');
const { Option } = Select;

const ListMember = () => {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const memberId = queryParams.get('clubId');
  const [member, setMember] = useState([]);
    const [id , setId] = useState('')
    const [sexe, setSexe] = useState("");
    const [categories, setCategories] = useState("");
    const [nomPrenomMembre, setNomPrenomMembre] = useState("");
    const [dateNaissance, setDateNaissance] = useState("");
    const [lieuNaissance, setLieuNaissance] = useState("");
    const [numeroCarteCIN, setNumeroCarteCIN] = useState("");
    const [dateCreationCarteCIN, setDateCreationCarteCIN] = useState("");
    const [cas, setCas] = useState([]);
    const [adresse, setAdresse] = useState("");
    const [etablissement, setEtablissement] = useState("");
    const [image, setImage] = useState(null);
    const [status, setStatus] = useState("Inscrit");
    const [alertMessage, setAlertMessage] = useState(null);

    const [numFemmes, setNumFemmes] = useState(0);
    const [numHommes, setNumHommes] = useState(0);
    const [numNonInscrits, setNumNonInscrits] = useState(0);
    const [numInscrits, setNumInscrits] = useState(0);
    const handleCasChange = (value) => {
        if (cas.includes(value)) {
          // Si la valeur est déjà dans le tableau, la supprimer
          setCas(cas.filter((item) => item !== value));
        } else {
          // Sinon, l'ajouter au tableau
          setCas([...cas, value]);
        }
      };


      useEffect(() => {
        fetchData();
      }, [clubId]);
    
      const fetchData = async () => {
        try {
          const result = await localDB.allDocs({ include_docs: true });
          const currentTime = new Date();
          const updatedMembers = result.rows
            .map(row => row.doc)
            .filter(member => member.clubId === clubId) // Filtrer les membres par ID utilisateur
            .map(member => {
              const registrationDate = new Date(member.dateInscription); // Changer le champ avec le champ de la date d'inscription réel
              const timeDiff = currentTime - registrationDate;
              const daysDiff = timeDiff / (1000 * 3600 * 24);
              if (member.status === 'inscrit' && daysDiff >= 365) {
                member.status = 'non inscrit';
              }
              return member;
            });
             // Calculer les statistiques
    const Femmes = updatedMembers.filter(member => member.sexe === 'Femme').length;
    const Hommes = updatedMembers.filter(member => member.sexe === 'Homme').length;
    const nonInscrits = updatedMembers.filter(member => member.status === 'non inscrit').length;
    const inscrits = updatedMembers.filter(member => member.status === 'inscrit').length;

    setNumFemmes(Femmes);
    setNumHommes(Hommes);
    setNumNonInscrits(nonInscrits);
    setNumInscrits(inscrits);

    setMember(updatedMembers);
          setMember(updatedMembers);
        } catch (error) {
          console.error('Erreur lors de la récupération des données :', error);
        }
      };
      
    const AddMember = async () => {
      // Générer un nouvel identifiant unique
      const _id = uuidv4();
    
      try {
        // Récupérer le document du club en utilisant clubId
        const clubDoc = await clubDB.get(clubId);
    
        // Vérifier si le solde est supérieur ou égal à 10
        if (clubDoc.solde >= 10) {
          let base64Image = null; // Initialiser base64Image à null
    
          if (image) {
            // Convertir l'image Blob en base64 seulement si une image est fournie
            const reader = new FileReader();
            reader.onload = async function (event) {
              base64Image = event.target.result;
    
              // Appel à votre logique d'ajout de membre
              addMemberWithData(_id, base64Image);
            };
    
            reader.readAsDataURL(image);
          } else {
            // Appel à votre logique d'ajout de membre sans image
            addMemberWithData(_id, base64Image);
          }
        } else {
          // Afficher l'alerte
          setAlertMessage("Solde insuffisant: au moins 10 sont requis");
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout du membre localement :", error);
      }
    };
    
    

const addMemberWithData = async (_id, base64Image) => {
  try {
    // Obtenir le document du club correspondant au clubId
    const clubDoc = await clubDB.get(clubId);

    // Créer un nouvel objet membre avec les données
    const newMember = {
      _id,
      clubId,
      licence: 'Joueur',
      sexe,
      categories,
      nomClub: clubDoc.nomclub, // Utiliser le nom de club du document du club
      nomPrenomMembre,
      dateNaissance,
      lieuNaissance,
      numeroCarteCIN,
      dateCreationCarteCIN,
      cas,
      adresse,
      etablissement,
      image: base64Image, // Utiliser la valeur de base64Image ici (peut être null)
      status: 'inscrit'
    };

    // Insérer le nouveau document dans la base locale (PouchDB)
    await localDB.put(newMember);

    // Déduire 10 du champ "solde" du club dans la base de données "club_db"
    const updatedClubDoc = {
      ...clubDoc,
      solde: clubDoc.solde - 10
    };

    // Mettre à jour le document du club dans la base de données "club_db"
    await clubDB.put(updatedClubDoc);

    fetchData();
    handleAddClose();

    // Reste de votre logique
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre localement :", error);
  }
};






      // UPDATE Member
      const updateMember = async (id, updates, image) => {
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
               
                setSexe('');
                setCategories('');
                setNomPrenomMembre('');
                setDateNaissance('');
                setLieuNaissance('');
                setNumeroCarteCIN('');
                setDateCreationCarteCIN('');
                setCas('');
                setAdresse('');
                setEtablissement('');
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
        
            setSexe('');
            setCategories('');
            setNomPrenomMembre('');
            setDateNaissance('');
            setLieuNaissance('');
            setNumeroCarteCIN('');
            setDateCreationCarteCIN('');
            setCas('');
            setAdresse('');
            setEtablissement('');
            setImage(null);
      
            return true;
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du document :', error);
          return false;
        }
      };
      
  
  // DELETE Member
  const deleteMember = async (idToDelete) => {
    try {
      const existingDoc = await localDB.get(idToDelete);
  
        // Supprimer le document en utilisant son _id et _rev
        await localDB.remove(existingDoc._id, existingDoc._rev);
  
        setMember((prevMembers) => prevMembers.filter((item) => item._id !== idToDelete));
        handleDelClose();
      
        fetchData(); // Rafraîchir les données après la suppression
  
        // Fermer le modal de suppression ici
        handleDelClose();
  
    } catch (error) {
      console.error('Erreur lors de la suppression dans PouchDB :', error);
      return false;
    }
  };


  const handleStatusChange = async (newStatus, memberId) => {
    try {
      // Récupérer le membre correspondant à l'ID
      const memberToUpdate = member.find(m => m._id === memberId);
  
      // Si le statut change à "inscrit" et le statut précédent n'était pas "inscrit"
      if (newStatus === 'inscrit' && memberToUpdate.status !== 'inscrit') {
        // Récupérer le document du club en utilisant clubId
        const clubDoc = await clubDB.get(clubId);
  
        // Vérifier si le solde est supérieur ou égal à 10
        if (clubDoc.solde >= 10) {
          // Déduire 10 du solde du club
          clubDoc.solde -= 10;
  
          // Mettre à jour le document du club dans la base de données "club_db"
          await clubDB.put(clubDoc);
  
          // Mettre à jour le statut du membre en "inscrit"
          const updatedMember = { ...memberToUpdate, status: newStatus };
          await localDB.put(updatedMember);
  
          // Mettre à jour l'état local avec le membre mis à jour
          setMember(prevMembers =>
            prevMembers.map(m => (m._id === memberId ? updatedMember : m))
          );
        } else {
        
          // Afficher l'alerte
          message.error("Solde insuffisant: au moins 10 sont requis");
          return;
        }
      } else {
        // Si le statut change à "non inscrit", pas besoin de déduire le solde
        const updatedMember = { ...memberToUpdate, status: newStatus };
        await localDB.put(updatedMember);
  
        // Mettre à jour l'état local avec le membre mis à jour
        setMember(prevMembers =>
          prevMembers.map(m => (m._id === memberId ? updatedMember : m))
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
  };
  

    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState("nomPrenom"); // Par défaut, tri par nom
    const [currentPage, setCurrentPage] = useState(1);

    const handleEditShow = (id) =>{
   
        member.forEach ( c =>{
         if (c._id == id){
              setId(c._id);
              setSexe(c.sexe);
              setCategories(c.categories);
              setNomPrenomMembre(c.nomPrenomMembre);
              setDateNaissance(c.dateNaissance);
              setLieuNaissance(c.lieuNaissance);
              setDateCreationCarteCIN(c.dateCreationCarteCIN);
              setNumeroCarteCIN(c.numeroCarteCIN);
              setAdresse(c.adresse);
              setCas(c.cas);
              setEtablissement(c.etablissement);
              setImage(c.image);
           console.log(c)
         }
        })
        setEditShow(true);}
      
      
        const handleDelShow = (iddel) =>{
         
          member.forEach ( c =>{
           if (c._id == iddel){
                setId(c._id);
               
             console.log(c)
           }
          })
          setDelShow(true);}

//SEARCH
const filteredMembres = member.filter(member => {
    const fullName = `${member.nomPrenomMembre}`.toLowerCase();
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

  


  //modal SHOW
  const [Addshow, setAddShow] = useState(false);

  const handleAddShow = () => setAddShow(true);
//modal EDIT
  const [Editshow, setEditShow] = useState(false);
  const handleEditClose = () => setEditShow(false);

  //modal DELETE
  const [Delshow, setDelShow] = useState(false);
  const handleDelClose = () => setDelShow(false);

  // Dans la fonction de fermeture du popup d'ajout
const handleAddClose = () => {
  setSexe('');
  setCategories('');
  setNomPrenomMembre('');
  setDateNaissance('');
  setLieuNaissance('');
  setNumeroCarteCIN('');
  setDateCreationCarteCIN('');
  setCas([]);
  setAdresse('');
  setEtablissement('');
  setImage(null);
  setAlertMessage(null);
  setAddShow(false);
};


  
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page

  //Pagination
  const membersPerPage = 2; // Nombre d'utilisateurs par page
  const indexOfLastMember = currentPage * rowsPerPage;
  const indexOfFirstMember = indexOfLastMember - rowsPerPage;
  const currentMembers = sortedAndFilteredMembres.slice(indexOfFirstMember, indexOfLastMember);
  

const handleRowsPerPageChange = value => {
  setRowsPerPage(value);
  setCurrentPage(1); // Reset to the first page when changing rows per page
};

//PRINT DATA 

const ListMemberPDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(20);
    doc.setTextColor(0, 128, 0);
    doc.setFont('bold');
    doc.text('Liste des Membres', 20, 20);

    const tableData = member.map((member, index) => [
      index + 1,
      { content: member.nomPrenomMembre, styles: 'cellStyle' },
      member.nomClub,
      member.categories,
      member.status,
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
      filename: 'ListeMember.pdf',
      callback: () => {
        // Afficher une alerte après le téléchargement
        window.alert('Téléchargement réussi : ListeMember.pdf');
      },
    });
    doc.save('ListeMember.pdf');

  };
  
    return(
        <div className='joueurcontient'>
            <SideBar/>
            <div className='membermain'>
            <div className="backbtn-accueil" onClick={() => navigate(-1)}>
          <ArrowBackIcon  /> Accueil du club
        </div> 
        <h2 className='title-joueur-total'>Liste des joueurs</h2>
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


<div  className='headbtnjoueur'>
<Button style={{backgroundColor:'#4169E1'}} className='mb-3' onClick={handleAddShow}>Ajouter</Button>

<Tooltip title="Télécharger">
     <DownloadForOfflineIcon onClick={ListMemberPDF} sx={{ fontSize: 40,color: 'gray',cursor: 'pointer' }} />
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
          {currentMembers.map((member, index) => (
            <tr key={member._id}>
              <td>{index + 1}</td>
              <td>{member.nomPrenomMembre}</td>
              <td>{member.nomClub}</td>
              <td>{member.categories}</td>
              <td>
                <img src={member.image} alt="" width="50" />
              </td>
        <td>
  {member.status === 'inscrit' ? (
    <Button
    style={{backgroundColor:"#6fb551",borderColor: '#6fb551'}}
      onClick={() => handleStatusChange('non inscrit', member._id)}
      className='btnstatus'
   >
      Inscrit
    </Button>
  ) : (
    <Button
    style={{ backgroundColor: "#ea5252", borderColor: "#ea5252" }}
      onClick={() => handleStatusChange('inscrit', member._id)}
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
    <Dropdown.Item onClick={() => navigate(`/member/${member._id}`)}><Person2Icon sx={{color:'gray'}}/>Profil de joueur </Dropdown.Item>
    <Dropdown.Item onClick={() => handleEditShow(member._id)}><EditIcon sx={{color:'gray'}}/>Modifier</Dropdown.Item>
    <Dropdown.Item onClick={() => handleDelShow(member._id)}><DeleteIcon sx={{color:'gray'}}/>Supprimer</Dropdown.Item>
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
          </div>
     {/*PopupModifier*/}
 
     <Modal show={Editshow} onHide={handleEditClose} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Modifier Membre</Modal.Title>
  </Modal.Header>
  <Modal.Body>
  <Form id="form" className="add-member-form">
          <Row className="mb-3">
            <Form.Group as={Col} controlId="nomPrenomMembre">
              <Form.Label className='label-modal'>Nom complet</Form.Label>
              <Form.Control
              className='form-control'
                type="text"
                placeholder="Entrer le nom et prénom"
                value={nomPrenomMembre}
                onChange={(e) => setNomPrenomMembre(e.target.value)}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="categories">
              <Form.Label className='label-modal'>Catégories</Form.Label>
              <Form.Control
              className='form-control'
                as="select"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
              >
                <option value="">Sélectionner catégorie</option>
                <option value="U11">U11</option>
                <option value="U13">U13</option>
                <option value="U15">U15</option>
                <option value="U17">U17</option>
                <option value="U19">U19</option>
                <option value="Senior">Senior</option>
              </Form.Control>
            </Form.Group>

            
          </Row>

          <Row className="mb-3">
           
            <Form.Group as={Col} controlId="dateNaissance">
              <Form.Label className='label-modal'>Date de naissance</Form.Label>
              <Form.Control
              className='form-control'
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="lieuNaissance">
              <Form.Label className='label-modal'>Lieu de naissance</Form.Label>
              <Form.Control
              className='form-control'
                type="text"
                placeholder="Entrer le lieu de naissance"
                value={lieuNaissance}
                onChange={(e) => setLieuNaissance(e.target.value)}
              />
            </Form.Group>

          </Row>

          <Row className="mb-3">

          <Form.Group as={Col} controlId="numeroCarteCIN">
              <Form.Label className='label-modal'>CIN</Form.Label>
              <Form.Control
              className='form-control'
                type="number"
                placeholder="Entrer le numéro de CIN"
                value={numeroCarteCIN}
                onChange={(e) => setNumeroCarteCIN(e.target.value)}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="dateCreationCarteCIN">
              <Form.Label className='label-modal'>Date de création CIN</Form.Label>
              <Form.Control
              className='form-control'
                type="date"
                value={dateCreationCarteCIN}
                onChange={(e) => setDateCreationCarteCIN(e.target.value)}
              />
            </Form.Group>
          </Row>
          <Row className="mb-3">
          <Form.Group as={Col} controlId="cas" >
  <Form.Label className='label-modal'>Cas</Form.Label>
  <div className='check-sexe-cas' >
    <Form.Check
      type="checkbox"
      label="Élève"
      name="cas"
      value="eleve"
      checked={cas.includes('eleve')}
      onChange={(e) => handleCasChange(e.target.value)}
    />
    <Form.Check
      type="checkbox"
      label="Étudiant"
      name="cas"
      value="etudiant"
      checked={cas.includes('etudiant')}
      onChange={(e) => handleCasChange(e.target.value)}
    />
    <Form.Check
      type="checkbox"
      label="Arrêté d'étudier"
      name="cas"
      value="arrete"
      checked={cas.includes('arrete')}
      onChange={(e) => handleCasChange(e.target.value)}
    />
    <Form.Check
      type="checkbox"
      label="Il/elle a un métier"
      name="cas"
      value="metier"
      checked={cas.includes('metier')}
      onChange={(e) => handleCasChange(e.target.value)}
    />
    <Form.Check
      type="checkbox"
      label="Handicape"
      name="sante"
      value="handicape"
      checked={cas.includes('handicape')}
      onChange={(e) => handleCasChange(e.target.value)}
    />
  </div>
</Form.Group>
</Row>
<Row className="mb-3">
<Form.Group as={Col} controlId="sexe">
              <Form.Label className='label-modal'>Sexe</Form.Label>
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
            </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="adresse">
              <Form.Label className='label-modal'>Adresse</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrer l'adresse"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="etablissement">
              <Form.Label className='label-modal'>L'établissement scolaire/universitaire</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrer l'établissement scolaire/universitaire"
                value={etablissement}
                onChange={(e) => setEtablissement(e.target.value)}
              />
            </Form.Group>
         
          </Row>
          <Form.Group as={Col} controlId="image">
        <Form.Label className='label-modal'>Photo</Form.Label>
        <Form.Control
        className='form-control-img'
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </Form.Group>

        </Form>
       
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleEditClose}>
      Fermer
    </Button>
    <Button
  style={{backgroundColor:'#4169E1'}}
  onClick={() => updateMember(id, {
    
    sexe,
    categories,
    nomPrenomMembre,
    dateNaissance,
    lieuNaissance,
    numeroCarteCIN,
    dateCreationCarteCIN,
    cas,
    adresse,
    etablissement
  }, image)}
>
  Modifier
</Button>
  </Modal.Footer>
</Modal>




{/*Popup Ajout*/}

<Modal show={Addshow} onHide={handleAddClose}  size="lg">

      <Modal.Header closeButton>
        <Modal.Title>Ajouter Membre</Modal.Title>
      </Modal.Header>
      <Modal.Body>
    
        {alertMessage && (
          <div className="custom-alert">
            {alertMessage}
          </div>
        )}
        <Form id="form" className="add-member-form">
          <Row className="mb-3">
            <Form.Group as={Col} controlId="nomPrenomMembre">
              <Form.Label className='label-modal'>Nom complet</Form.Label>
              <Form.Control
              className='form-control'
                type="text"
                placeholder="Entrer le nom et prénom"
                value={nomPrenomMembre}
                onChange={(e) => setNomPrenomMembre(e.target.value)}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="categories">
              <Form.Label className='label-modal'>Catégories</Form.Label>
              <Form.Control
              className='form-control'
                as="select"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
              >
                <option value="">Sélectionner catégorie</option>
                <option value="U11">U11</option>
                <option value="U13">U13</option>
                <option value="U15">U15</option>
                <option value="U17">U17</option>
                <option value="U19">U19</option>
                <option value="Senior">Senior</option>
              </Form.Control>
            </Form.Group>

            
          </Row>

          <Row className="mb-3">
           
            <Form.Group as={Col} controlId="dateNaissance">
              <Form.Label className='label-modal'>Date de naissance</Form.Label>
              <Form.Control
              className='form-control'
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="lieuNaissance">
              <Form.Label className='label-modal'>Lieu de naissance</Form.Label>
              <Form.Control
              className='form-control'
                type="text"
                placeholder="Entrer le lieu de naissance"
                value={lieuNaissance}
                onChange={(e) => setLieuNaissance(e.target.value)}
              />
            </Form.Group>

          </Row>

          <Row className="mb-3">

          <Form.Group as={Col} controlId="numeroCarteCIN">
              <Form.Label className='label-modal'>CIN</Form.Label>
              <Form.Control
              className='form-control'
                type="number"
                placeholder="Entrer le numéro de CIN"
                value={numeroCarteCIN}
                onChange={(e) => setNumeroCarteCIN(e.target.value)}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="dateCreationCarteCIN">
              <Form.Label className='label-modal'>Date de création CIN</Form.Label>
              <Form.Control
              className='form-control'
                type="date"
                value={dateCreationCarteCIN}
                onChange={(e) => setDateCreationCarteCIN(e.target.value)}
              />
            </Form.Group>
          </Row>
          <Row className="mb-3">
          <Form.Group as={Col} controlId="cas" >
  <Form.Label className='label-modal'>Cas</Form.Label>
  <div className='check-sexe-cas' >
    <Form.Check
      type="checkbox"
      label="Élève"
      name="cas"
      value="eleve"
      checked={cas.includes('eleve')}
      onChange={(e) => handleCasChange(e.target.value)}
    />
    <Form.Check
      type="checkbox"
      label="Étudiant"
      name="cas"
      value="etudiant"
      checked={cas.includes('etudiant')}
      onChange={(e) => handleCasChange(e.target.value)}
    />
    <Form.Check
      type="checkbox"
      label="Arrêté d'étudier"
      name="cas"
      value="arrete"
      checked={cas.includes('arrete')}
      onChange={(e) => handleCasChange(e.target.value)}
    />
    <Form.Check
      type="checkbox"
      label="Il/elle a un métier"
      name="cas"
      value="metier"
      checked={cas.includes('metier')}
      onChange={(e) => handleCasChange(e.target.value)}
    />
    <Form.Check
      type="checkbox"
      label="Handicape"
      name="sante"
      value="handicape"
      checked={cas.includes('handicape')}
      onChange={(e) => handleCasChange(e.target.value)}
    />
  </div>
</Form.Group>
</Row>
<Row className="mb-3">
<Form.Group as={Col} controlId="sexe">
              <Form.Label className='label-modal'>Sexe</Form.Label>
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
            </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="adresse">
              <Form.Label className='label-modal'>Adresse</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrer l'adresse"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="etablissement">
              <Form.Label className='label-modal'>L'établissement scolaire/universitaire</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrer l'établissement scolaire/universitaire"
                value={etablissement}
                onChange={(e) => setEtablissement(e.target.value)}
              />
            </Form.Group>
         
          </Row>
          <Form.Group as={Col} controlId="image">
        <Form.Label className='label-modal'>Photo</Form.Label>
        <Form.Control
        className='form-control-img'
          type="file"
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
        <Button style={{ backgroundColor: '#4169E1' }} onClick={AddMember}>
          Ajouter
        </Button>
      </Modal.Footer>
     
    </Modal>
   



{/*Popup supprimer*/}
<Modal show={Delshow} onHide={handleDelClose}>
  <Modal.Header closeButton>
    <Modal.Title>Suppression</Modal.Title>
  </Modal.Header>
  <Modal.Body >
    <p>Êtes-vous sûr de vouloir supprimer cet joueur ?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleDelClose}>
      Annuler
    </Button>
    <Button variant="danger" onClick={() => deleteMember(id)}>
      Confirmer
    </Button>
  </Modal.Footer>
 
</Modal>
</div>
</div>

    )
}
export default ListMember;