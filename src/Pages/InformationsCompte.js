import React, { useEffect, useState } from 'react';
import PouchDB from 'pouchdb';
import 'pouchdb-find';
import './InformationsCompte.css'

PouchDB.plugin(require('pouchdb-find'));
const clubDB = new PouchDB('club_db');
const memberAdminDB = new PouchDB('MembreAdminDB');
const arbitreDB = new PouchDB('arbitre_db');
const joueurDB = new PouchDB('MembreDB');
const paiementDB = new PouchDB('PaimentHistory_db');
const InformationsCompte = () => {
  const [clubCount, setClubCount] = useState(0);
  const [joueurCount, setJoueurCount] = useState(0);
  const [membreAdminCount, setMembreAdminCount] = useState(0);
  const [arbitreCount, setArbitreCount] = useState(0);
  const [joueurHommeCount, setJoueurHommeCount] = useState(0);
  const [joueurFemmeCount, setJoueurFemmeCount] = useState(0);
  const [membreAdminHommeCount, setMembreAdminHommeCount] = useState(0);
  const [membreAdminFemmeCount, setMembreAdminFemmeCount] = useState(0);
  const [arbitreHommeCount, setArbitreHommeCount] = useState(0);
  const [arbitreFemmeCount, setArbitreFemmeCount] = useState(0);
  const [joueurByCategory, setJoueurByCategory] = useState({});
  const [totalHommeCount, setTotalHommeCount] = useState(0);
  const [totalFemmeCount, setTotalFemmeCount] = useState(0);
  const [clubActifCount, setClubActifCount] = useState(0);
const [totalSoldePaiement, setTotalSoldePaiement] = useState(0);
const [inactiveClubCount, setInactiveClubCount] = useState(0);
const [inscritJoueurCount, setInscritJoueurCount] = useState(0);
const [nonInscritJoueurCount, setNonInscritJoueurCount] = useState(0);
const [inscritMembreAdminCount, setInscritMembreAdminCount] = useState(0);
const [nonInscritMembreAdminCount, setNonInscritMembreAdminCount] = useState(0);
const [inscritArbitreCount, setInscritArbitreCount] = useState(0);
const [nonInscritArbitreCount, setNonInscritArbitreCount] = useState(0);
const [inscritHommeCount, setInscritHommeCount] = useState(0);
const [nonInscritFemmeCount, setNonInscritFemmeCount] = useState(0);
const [inscritFemmeCount, setInscritFemmeCount] = useState(0);
const [nonInscritHommeCount, setNonInscritHommeCount] = useState(0);


 const fetchStatistics = async () => {
  try {
    const clubDocs = await clubDB.allDocs();
    const membreAdminDocs = await memberAdminDB.allDocs();
    const arbitreDocs = await arbitreDB.allDocs();
    setClubCount(clubDocs.total_rows);
    setMembreAdminCount(membreAdminDocs.total_rows);
    setArbitreCount(arbitreDocs.total_rows);

    const joueurResult = await joueurDB.allDocs({ include_docs: true });
    const joueurs = joueurResult.rows.map(row => row.doc);
    setJoueurCount(joueurs.length);

    const HommeJoueurs = joueurs.filter(joueur => joueur.sexe && (joueur.sexe === 'Homme' || joueur.sexe === 'homme'));
    const FemmeJoueurs = joueurs.filter(joueur => joueur.sexe && (joueur.sexe === 'Femme' || joueur.sexe === 'femme'));
    setJoueurHommeCount(HommeJoueurs.length);
    setJoueurFemmeCount(FemmeJoueurs.length);
    // Calculer le nombre de joueurs inscrits et non inscrits
    const inscritJoueurCount = joueurs.filter(joueur => joueur.status === 'inscrit').length;
    const nonInscritJoueurCount = joueurs.filter(joueur => joueur.status === 'non inscrit').length;

    setInscritJoueurCount(inscritJoueurCount);
    setNonInscritJoueurCount(nonInscritJoueurCount);

    const membreAdminResult = await memberAdminDB.allDocs({ include_docs: true });
    const membresAdmin = membreAdminResult.rows.map(row => row.doc);
    const HommeMembresAdmin = membresAdmin.filter(membre => membre.sexe && (membre.sexe === 'Homme' || membre.sexe === 'homme'));
    const FemmeMembresAdmin = membresAdmin.filter(membre => membre.sexe && (membre.sexe === 'Femme' || membre.sexe === 'femme'));
      // Calculer le nombre de membres administratifs inscrits et non inscrits
      const inscritMembreAdminCount = membresAdmin.filter(membre => membre.status === 'inscrit').length;
      const nonInscritMembreAdminCount = membresAdmin.filter(membre => membre.status === 'non inscrit').length;
  
      setInscritMembreAdminCount(inscritMembreAdminCount);
      setNonInscritMembreAdminCount(nonInscritMembreAdminCount);
  
    setMembreAdminHommeCount(HommeMembresAdmin.length);
    setMembreAdminFemmeCount(FemmeMembresAdmin.length);

    const arbitreResult = await arbitreDB.allDocs({ include_docs: true });
    const arbitres = arbitreResult.rows.map(row => row.doc);
    const HommeArbitres = arbitres.filter(arbitre => arbitre.sexe && (arbitre.sexe === 'Homme' || arbitre.sexe === 'homme'));
    const FemmeArbitres = arbitres.filter(arbitre => arbitre.sexe && (arbitre.sexe === 'Femme' || arbitre.sexe === 'femme'));
    // Calculer le nombre d'arbitres inscrits et non inscrits
    const inscritArbitreCount = arbitres.filter(arbitre => arbitre.status === 'inscrit').length;
    const nonInscritArbitreCount = arbitres.filter(arbitre => arbitre.status === 'non inscrit').length;

    setInscritArbitreCount(inscritArbitreCount);
    setNonInscritArbitreCount(nonInscritArbitreCount);
    setArbitreHommeCount(HommeArbitres.length);
    setArbitreFemmeCount(FemmeArbitres.length);

    const joueurByCategoryCount = {};
    joueurs.forEach(joueur => {
      const category = joueur.categories;
      if (!joueurByCategoryCount[category]) {
        joueurByCategoryCount[category] = { Homme: 0, Femme: 0 };
      }
      if (joueur.sexe && (joueur.sexe === 'Homme' || joueur.sexe === 'homme')) {
        joueurByCategoryCount[category].Homme++;
      } else if (joueur.sexe && (joueur.sexe === 'Femme' || joueur.sexe === 'femme')) {
        joueurByCategoryCount[category].Femme++;
      }
    });

    setJoueurByCategory(joueurByCategoryCount);
    
    // Calculer le nombre total de males et de femelles
    const totalHomme =
      HommeJoueurs.length + HommeMembresAdmin.length + HommeArbitres.length;
    const totalFemme =
      FemmeJoueurs.length + FemmeMembresAdmin.length + FemmeArbitres.length;
    
    setTotalHommeCount(totalHomme);
    setTotalFemmeCount(totalFemme);
    
    // Calculer le nombre total d'hommes inscrits (arbitres, membres administratifs, joueurs)
     const inscritHommeCount = [
        ...arbitres,
        ...membresAdmin,
        ...joueurs
      ].filter(person => person.status === 'inscrit' && (person.sexe === 'Homme' || person.sexe === 'homme')).length;
      setInscritHommeCount(inscritHommeCount);
   // Calculer le nombre total d'hommes non inscrits (arbitres, membres administratifs, joueurs)
   const nonInscritHommeCount = [
    ...arbitres,
    ...membresAdmin,
    ...joueurs
  ].filter(person => person.status === 'non inscrit' && (person.sexe === 'Homme' || person.sexe === 'homme')).length;

  setNonInscritHommeCount(nonInscritHommeCount);
      // Calculer le nombre total de femmes non inscrites (arbitres, membres administratifs, joueurs)
  const nonInscritFemmeCount = [
    ...arbitres,
    ...membresAdmin,
    ...joueurs
  ].filter(person => person.status === 'non inscrit' && (person.sexe === 'Femme' || person.sexe === 'femme')).length;

  setNonInscritFemmeCount(nonInscritFemmeCount);
// Calculer le nombre total de femmes inscrites (arbitres, membres administratifs, joueurs)
const inscritFemmeCount = [
    ...arbitres,
    ...membresAdmin,
    ...joueurs
  ].filter(person => person.status === 'inscrit' && (person.sexe === 'Femme' || person.sexe === 'femme')).length;

  setInscritFemmeCount(inscritFemmeCount);
    // Calculer le nombre de clubs actifs
    const clubActifDocs = await clubDB.find({
        selector: {
          statusclub: 'actif'
        }
      });
      setClubActifCount(clubActifDocs.docs.length);
       // Calculer le nombre de clubs non actifs
    const inactiveClubCount = await clubDB.find({
    selector: {
        statusclub: 'non actif'
      }
    });
    setInactiveClubCount(inactiveClubCount.docs.length);
      
      // Calculer la somme des soldes de paiement
    const paiementDocs = await paiementDB.allDocs({ include_docs: true });
    const soldePaiement = paiementDocs.rows
      .map(row => parseFloat(row.doc.soldePaiement)) // Convertir en nombre
      .reduce((acc, curr) => acc + curr, 0); // Somme
    setTotalSoldePaiement(soldePaiement);

   

    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques :', error);
  }
};

  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <div >
     <fieldset className="info-group-compte">
    <legend>Statistiques Globales</legend>
     

      <p className='details-items-info'><span className='items-contient-info'>Nombre total d'individus masculins :</span> {totalHommeCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre total d'individus féminins :</span> {totalFemmeCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre total d'hommes inscrits :</span> {inscritHommeCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre total d'hommes non inscrits :</span> {nonInscritHommeCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre total de femmes inscrites :</span> {inscritFemmeCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre total de femmes non inscrites :</span> {nonInscritFemmeCount}</p>

      </fieldset>
     <fieldset className="info-group-compte">
    <legend>Statistiques des clubs</legend>
      <p className='details-items-info'><span className='items-contient-info'>Nombre de clubs :</span> {clubCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre de clubs actifs :</span> {clubActifCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre de clubs non actifs :</span> {inactiveClubCount}</p>

      <p className='details-items-info'><span className='items-contient-info'>Somme totale des soldes de paiement :</span> {totalSoldePaiement}</p>
        </fieldset>
      
        <fieldset className="info-group-compte">
    <legend>Statistiques des Joueurs</legend>
     
      <p className='details-items-info'><span className='items-contient-info'>Nombre de joueurs :</span> {joueurCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre de joueurs inscrits :</span> {inscritJoueurCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre de joueurs non inscrits :</span> {nonInscritJoueurCount}</p>

      <p className='details-items-info'><span className='items-contient-info'>Nombre de joueurs masculins :</span> {joueurHommeCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre de joueurs féminins :</span> {joueurFemmeCount}</p>
      <p className='details-items-info'><span className='items-contient-info'> Joueurs par catégorie :</span></p>
      <ul className="category-list">
  {Object.keys(joueurByCategory).map(category => (
    <li key={category} className="category-item">
      <span className="category-name">{category}</span> : Masculins : {joueurByCategory[category].Homme}, Féminins : {joueurByCategory[category].Femme}
    </li>
  ))}
</ul>

      </fieldset>
      <fieldset className="info-group-compte">
    <legend>Statistiques des Membres Administratifs</legend>

      <p className='details-items-info'><span className='items-contient-info'>Nombre de membres administratifs :</span> {membreAdminCount}</p>

      <p className='details-items-info'><span className='items-contient-info'>Nombre de membres administratifs masculins :</span> {membreAdminHommeCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre de membres administratifs féminins :</span> {membreAdminFemmeCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre de membres administratifs inscrits :</span> {inscritMembreAdminCount}</p>
<p className='details-items-info'><span className='items-contient-info'>Nombre de membres administratifs non inscrits :</span> {nonInscritMembreAdminCount}</p>
</fieldset>
<fieldset className="info-group-compte">
    <legend>Statistiques des Arbitres</legend>
      
      <p className='details-items-info'><span className='items-contient-info'>Nombre d'arbitres :</span> {arbitreCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre d'arbitres masculins :</span> {arbitreHommeCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre d'arbitres féminins :</span> {arbitreFemmeCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre d'arbitres inscrits :</span> {inscritArbitreCount}</p>
      <p className='details-items-info'><span className='items-contient-info'>Nombre d'arbitres non inscrits :</span> {nonInscritArbitreCount}</p>
</fieldset>

    </div>
   
  );
};

export default InformationsCompte;
