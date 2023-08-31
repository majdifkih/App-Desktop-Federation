import React, { useEffect, useState } from 'react';
import { Table, Form, Modal, Button, Dropdown, Alert  } from 'react-bootstrap';
import { Pagination as AntdPagination, Select } from 'antd';
import ListIcon from '@mui/icons-material/List';
import SearchIcon from '@mui/icons-material/Search';
import SideBar from '../Components/SideBar';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import './PaiementClub.css';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';

PouchDB.plugin(PouchDBFind);
const localDB = new PouchDB('club_db');
const paiementDB = new PouchDB('PaimentHistory_db');
const { Option } = Select;

function PaiementClub() {
  const { clubId } = useParams();
  const [club, setClub] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [clubName, setClubName] = useState('');
  const [id, setId] = useState('');
  const [ref, setRef] = useState('');
  const [soldpaiment, setSoldPaiement] = useState('');
  const [preuve, setPreuve] = useState(null);
  const [statuspaiement, setStatusPaiment] = useState('En cours');
  const [selectedValue, setSelectedValue] = useState('');
  
const [searchTerm, setSearchTerm] = useState('');
const [sortOption, setSortOption] = useState("datepaiement"); // Par défaut, tri par nom
const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page
const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    localDB.get(clubId)
      .then((result) => {
        setClub(result);
        setClubName(result.nomclub);
    
    
      })
      .catch((error) => {
        console.error('Error fetching club:', error);
      });

    // Charger l'historique de paiement pour le club
    loadPaymentHistory(clubId);
  }, [clubId]);

  


  const loadPaymentHistory = async (clubId) => {
    try {
      const result = await paiementDB.find({
        selector: {
          _id: { $regex: `^${clubId}_payment_` }
        }
      });

      setPaymentHistory(result.docs);
      if (result.docs.length > 0) {
        const lastPayment = result.docs[result.docs.length - 1];
        setSelectedValue(lastPayment.statuspaiement); // Stocker la valeur dans l'état
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };
//Reference unique
  const isDuplicate = paymentHistory.some(paymentHistory => paymentHistory.ref === ref);


  const AddPaiment = async (e) => {
    e.preventDefault();
    try {
      const paymentId = `${clubId}_payment_${new Date().getTime()}`;
  
      // Check if the reference is already used
      const existingPayment = paymentHistory.find(payment => payment.ref === ref);
      if (existingPayment) {
        console.error('This reference is already used.');
        return; // Exit the function if the reference is not unique
      }
  
      const newPayment = {
        _id: paymentId,
        clubId: clubId,
        ref: ref,
        soldePaiement: soldpaiment,
        dateCreation: format(new Date(), "yyyy/MM/dd hh:mm:ss"),
        preuve: null, // Par défaut, aucune preuve
        statuspaiement: 'En cours',
      };
  
      if (preuve instanceof Blob) {
        // Convert the image Blob to base64
        const reader = new FileReader();
        reader.onload = async function (event) {
          const base64Image = event.target.result;
          newPayment.preuve = base64Image;
  
          try {
            // Insert the new payment into the local database (PouchDB)
            await paiementDB.put(newPayment);
  
            // Update the payment history
            setPaymentHistory([...paymentHistory, newPayment]);
  
            // Show a success message to the user
            console.log('Payment added successfully');
          } catch (error) {
            console.error('Error adding payment to the database:', error);
            // Show an error message to the user
          }
  
          // Reset the states related to payment addition
          setId('');
          setSoldPaiement('');
          setPreuve(null);
  
          // Close the add modal window
          handleAddClose();
        };
  
        reader.readAsDataURL(preuve);
      } else {
        // Insert the new payment into the local database (PouchDB)
        await paiementDB.put(newPayment);
  
        // Update the payment history
        setPaymentHistory([...paymentHistory, newPayment]);
  
        // Show a success message to the user
        console.log('Payment added successfully');
  
        // Reset the states related to payment addition
        setId('');
        setSoldPaiement('');
        setPreuve(null);
  
        // Close the add modal window
        handleAddClose();
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };
  


// UPDATE Member
const updatePaiment = async () => {
  try {
    const existingDoc = await paiementDB.get(id);

    const updatedDoc = {
      ...existingDoc,
      ref: ref,
      soldePaiement: soldpaiment,
      preuve: existingDoc.preuve // Garder l'ancienne preuve par défaut
    };

    if (preuve instanceof Blob) {
      // Convertir l'image Blob en base64
      const reader = new FileReader();
      reader.onload = async function (event) {
        const base64Image = event.target.result;
        updatedDoc.preuve = base64Image;

        // Mise à jour dans la base locale (PouchDB)
        await paiementDB.put(updatedDoc);

        // Mise à jour de l'état
        setPaymentHistory(prevHistory =>
          prevHistory.map(payment =>
            payment._id === existingDoc._id ? { ...payment, ...updatedDoc } : payment
          )
        );

        handleEditClose(); // Fermer la fenêtre modale
        setRef('');
        setSoldPaiement('');
        setPreuve(null);

        return true;
      };
      reader.readAsDataURL(preuve);
    } else {
      // Si preuve n'est pas défini, mettre à jour sans changer la preuve
      await paiementDB.put(updatedDoc);

      // Mise à jour de l'état
      setPaymentHistory(prevHistory =>
        prevHistory.map(payment =>
          payment._id === existingDoc._id ? { ...payment, ...updatedDoc } : payment
        )
      );

      handleEditClose(); // Fermer la fenêtre modale
      setRef('');
      setSoldPaiement('');
      setPreuve(null);

      return true;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour dans PouchDB :', error);
    return false;
  }
};



  const deleteClub = async (idToDelete) => {
    try {
      const existingDoc = await paiementDB.get(idToDelete);
  
      
        // Supprimer le document en utilisant son _id et _rev
      await paiementDB.remove(existingDoc._id, existingDoc._rev);
  
      setPaymentHistory((prevPaiement) => prevPaiement.filter((item) => item._id !== idToDelete));
      handleDelClose();
     
  
      
  
        // Fermer le modal de suppression ici
        handleDelClose();
  
        return true;
     
    } catch (error) {
      console.error('Erreur lors de la suppression dans PouchDB :', error);
      return false;
    }
  };


  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
  const [idToAccept, setIdToAccept] = useState('');
  const handleStatusChange = async (newStatus, PaiementId) => {
    try {
      if (newStatus === "Accepter") {
        setShowAcceptConfirmation(true); // Show confirmation modal
        // Store the ID of the payment that is being accepted
        setIdToAccept(PaiementId);
      } else {
        // For other status changes, update status immediately
        const updatedPaymentHistory = paymentHistory.map(payment =>
          payment._id === PaiementId ? { ...payment, statuspaiement: newStatus } : payment
        );
  
        setPaymentHistory(updatedPaymentHistory);
  
        // Update the status in the local database (PouchDB)
        const paiementToUpdate = await paiementDB.get(PaiementId);
        paiementToUpdate.statuspaiement = newStatus;
        await paiementDB.put(paiementToUpdate);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
  };

  const handleAcceptPayment = async (paymentId) => {
    try {
      // Mettre à jour le statut du paiement
      const updatedPaymentHistory = paymentHistory.map(payment =>
        payment._id === paymentId ? { ...payment, statuspaiement: 'Accepter' } : payment
      );
      setPaymentHistory(updatedPaymentHistory);
  
      // Mettre à jour le statut du paiement dans la base de données locale (PouchDB)
      const paiementToUpdate = await paiementDB.get(paymentId);
      paiementToUpdate.statuspaiement = 'Accepter';
      await paiementDB.put(paiementToUpdate);
  
      // Mettre à jour le solde du club dans la base de données locale (PouchDB)
      const clubDoc = await localDB.get(clubId);
      clubDoc.solde += parseFloat(paiementToUpdate.soldePaiement);
      clubDoc.statusclub = 'actif'; // Mettre à jour le statut du club
      await localDB.put(clubDoc);
  
      // Fermer la fenêtre modale de confirmation
      setShowAcceptConfirmation(false);
    } catch (error) {
      console.error("Erreur lors de l'acceptation du paiement :", error);
    }
  };
  
  
  
  //modal SHOW
  const [Addshow, setAddShow] = useState(false);


  const handleAddClose = () => {
   
    setRef('');
    setSoldPaiement('');
    setPreuve(null);

    setAddShow(false);
  };
  const handleAddShow = () => setAddShow(true);
  //modal EDIT
  const [Editshow, setEditShow] = useState(false);
  const handleEditClose = () => setEditShow(false);
 
  //modal DELETE
  const [Delshow, setDelShow] = useState(false);
  const handleDelClose = () => setDelShow(false);
 
  const handleEditShow = (id) => {
    const selectedPayment = paymentHistory.find(payment => payment._id === id);
  
    setId(selectedPayment._id);
    setRef(selectedPayment.ref);
    setSoldPaiement(selectedPayment.soldePaiement);
    setPreuve(null); // Mettez à jour le champ "preuve" avec la nouvelle valeur, s'il est nécessaire
    setStatusPaiment(selectedPayment.statuspaiement);
  
    setEditShow(true);
  };

  const handleDelShow = (iddel) =>{
   
    paymentHistory.forEach ( c =>{
     if (c._id == iddel){
          setId(c._id);
         
       console.log(c)
     }
    })
    setDelShow(true);}

    const [showEnlargedProof, setShowEnlargedProof] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState(null);
    
    const closeEnlargedProof = () => {
      setShowEnlargedProof(false);
      setEnlargedImage(null);
    };
    

//SEARCH

  // Assuming paymentHistory is an array containing payment data
  const filteredPaiements = paymentHistory.filter((paymentHistory) => {
    const paiementRef = `${paymentHistory.ref}`.toLowerCase();
    return paiementRef.includes(searchTerm.toLowerCase());
  });

  //TRIE
  const sortedAndFilteredPaiement = [...filteredPaiements].sort((a, b) => {
    if (sortOption === 'datepaiement') {
      if (a.dateCreation && b.dateCreation) {
        const dateA = new Date(a.dateCreation);
        const dateB = new Date(b.dateCreation);
        return dateB - dateA;
      }
      return 0;
    } else if (sortOption === 'solde') {
      return a.soldePaiement - b.soldePaiement;
    }
    if (sortOption === "statuspaiement") {
      
      if (a.status && b.nomclub) {
        return a.statuspaiement.localeCompare(b.statuspaiement);
      } 
    }
    return 0;
  });
  

  

const handleRowsPerPageChange = value => {
  setRowsPerPage(value);
  setCurrentPage(1); // Reset to the first page when changing rows per page
};

// Assuming club.currentPaiements is an array, otherwise adjust as needed


const indexOfLastPaiement = currentPage * rowsPerPage;
  const indexOfFirstPaiement = indexOfLastPaiement - rowsPerPage;
  const currentPaiement = sortedAndFilteredPaiement.slice(
    indexOfFirstPaiement,
    indexOfLastPaiement
  );


  return (
    <div className='headpaiementclub'>
      <SideBar />
      <div>
        <h2 className='title-name'>Historique de paiement du club: {clubName}</h2>

{/*Recherche*/}
<div className='search-paiement-container'>
                <SearchIcon className='search-paiement-icon' />
                <input
                  type="text"
                  placeholder="Rechercher"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='search-paiement'
                />
              </div>
      <div className='headbtn-paiement'>
      <Button style={{backgroundColor:'#4169E1'}} className='mb-3' onClick={handleAddShow}>Ajouter</Button>    
   

    {/*Trie*/}
      <div className="sort-options">
  <label>Trier par :</label>
  <select
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
  >
    <option value="datepaiement">Date paiement</option>
    <option value="statuspaiement">Status</option>
    <option value="solde">Solde</option>
  </select>
</div>

</div>
        <div className='tablecontient' >
        {currentPaiement  ? (
  <Table striped bordered hover>
    <thead>
              <tr>
        <th>#</th>
        <th>Réference</th>
        <th>Solde payé</th>
        <th>Date de paiement</th>
        <th>Preuve</th>
        <th>Status</th>
        <th>Détails</th>
      </tr>
      </thead>
    <tbody>
      {currentPaiement .map((payment, index) => (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{payment.ref}</td>
          <td>{payment.soldePaiement}</td>
          <td>{payment.dateCreation.toString()}</td>
         
         <td style={{ alignItems: 'center' }}>
  <img
    src={payment.preuve}
    alt=""
    style={{ maxWidth: '50px', maxHeight: '50px', cursor: 'pointer' }}
    onClick={() => {
      setShowEnlargedProof(true);
      setEnlargedImage(payment.preuve);
    }}
  />
</td>

          <td   style={{ alignItems: 'center' }}>
    <Form.Select
      aria-label="statuspaiement"
      value={payment.statuspaiement}
      onChange={(e) => handleStatusChange(e.target.value, payment._id)}
      className={`${
        payment.statuspaiement === 'En cours'
          ? 'status-en-cours'
          : payment.statuspaiement === 'Accepter'
          ? 'status-accepte'
          : 'status-refuse'
      }`}
    >
      <option value="En cours">En cours</option>
      <option value="Accepter">Accepter</option>
      <option value="Refuser">Refuser</option>
    </Form.Select>
  </td>
          <td>

<Dropdown>
<Dropdown.Toggle variant="link" id="dropdown-basic" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }} className="custom-dropdown-toggle">
<ListIcon sx={{color:'gray'}}/>
</Dropdown.Toggle>

<Dropdown.Menu>
<Dropdown.Item onClick={() => handleEditShow(payment._id)}>Modifier</Dropdown.Item>
<Dropdown.Item onClick={() => handleDelShow(payment._id)}>Supprimer</Dropdown.Item>
</Dropdown.Menu>
</Dropdown>



  
  {/*  */}
</td>
        </tr>
      ))}
    </tbody>
  </Table>
) : (

  <Alert variant='light'>
       Aucun paiement trouvé ...
      </Alert>
)}
        </div>
        {/* Pagination */}
        <div className='pagination'>
        <AntdPagination
        current={currentPage}
        pageSize={rowsPerPage}
        total={sortedAndFilteredPaiement.length}
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


        <Modal show={showEnlargedProof} onHide={closeEnlargedProof}>
  <Modal.Header closeButton>
    <Modal.Title>Preuve</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {enlargedImage && (
      <img
        src={enlargedImage}
        alt="Preuve agrandie"
        style={{ width: '100%', maxHeight: '80vh' }}
      />
    )}
  </Modal.Body>
</Modal>




        {/*Popup Ajout*/}
<Modal show={Addshow} onHide={handleAddClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter Paiement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {isDuplicate && (
      <div className="alert-message">
        <p>Identifiant existe déjà</p>
      </div>
    )}
        <Form id="form">
        

      <Form.Group controlId="idpaiement">
        <Form.Label>Réference</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer Réference"
          name="idpaiement"
          value={ref}
          onChange={ (e) =>{ setRef(e.target.value)}}
        />
      </Form.Group>
      <Form.Group controlId="soldepai">
        <Form.Label>Solde de paiment</Form.Label>
        <Form.Control
          type="number"
          placeholder="Entrer le solde"
          name="soldepai"
          value={soldpaiment}
          onChange={ (e) =>{ setSoldPaiement(e.target.value)}}
        />
      </Form.Group>

      <Form.Group controlId="image">
        <Form.Label>Preuve</Form.Label>
        <Form.Control
          type="file"
          name="image"
          accept="image/*" 
          onChange={(e) => setPreuve(e.target.files[0])}
        />
      </Form.Group>

    </Form>
    </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleAddClose}>
            Fermer
          </Button>
          <Button style={{backgroundColor:'#4169E1'}} onClick={AddPaiment}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>



{/*PopupModifier*/}
  
<Modal show={Editshow} onHide={handleEditClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier Paiement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
    <Form>
      
    <Form.Group controlId="idpaiement">
        <Form.Label>Réference</Form.Label>
        <Form.Control
          type="text"
          name="idpaiement"
          value={ref}
          onChange={ (e) =>{ setRef(e.target.value)}}
        />
      </Form.Group>
      <Form.Group controlId="soldepai">
        <Form.Label>Solde de paiment</Form.Label>
        <Form.Control
          type="number"
          name="soldepai"
          value={soldpaiment}
          onChange={ (e) =>{ setSoldPaiement(e.target.value)}}
        />
      </Form.Group>

      <Form.Group controlId="image">
        <Form.Label>Preuve</Form.Label>
        <Form.Control
          type="file"
          name="image"
          accept="image/*" 
          onChange={(e) => setPreuve(e.target.files[0])}
        />
      </Form.Group>

      
    </Form>
    </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditClose}>
            Fermer
          </Button>
          <Button style={{backgroundColor:'#4169E1'}}   onClick={() => updatePaiment(paymentHistory._id, {
   id,
   soldpaiment,
  }, preuve)}>
            Modifier
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

<Modal show={showAcceptConfirmation} onHide={() => setShowAcceptConfirmation(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Confirmation d'Acceptation</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>Êtes-vous sûr de vouloir accepter ce paiement ?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowAcceptConfirmation(false)}>
      Annuler
    </Button>
    <Button variant="success" onClick={() => handleAcceptPayment(idToAccept)}>
      Confirmer
    </Button>
  </Modal.Footer>
</Modal>

      </div>
    </div>
  );
}

export default PaiementClub;
