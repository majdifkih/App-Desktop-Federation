import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Routes, Route,HashRouter } from 'react-router-dom';
import ListerClub from './Pages/ListClub';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import ListMember from './Pages/ListMember';
import MemberProfile from './Pages/MemberProfil';
import ListArbitre from './Pages/ListArbitre';
import ArbitreProfil from './Pages/ArbitreProfil';
import AccueilClub from './Pages/AccueilClub';
import MemberAdmin from './Pages/MemberAdmin';
import MemberAdminProfil from './Pages/MemberAdminProfil';
import PaiementClub from './Pages/PaiementClub';
import ListJoueur from './Pages/JoueursTotal';
import ClubDetails from './Pages/ClubDetails';
import ParametrePage from './Pages/ParametrePage';
function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/club" element={<ListerClub/>} />
          <Route path="/home" element={<HomePage/>} />
          <Route path="/" element={<LoginPage/>} />
          <Route path="/club/:clubId/members" element={<ListMember/>} />
          <Route path="/member/:memberId" element={<MemberProfile/>} />
          <Route path="/arbitre" element={<ListArbitre/>} />
          <Route path="/arbitre/:arbitreId" element={<ArbitreProfil/>} />
          <Route path="/club/:clubId/Accueilclub" element={<AccueilClub/>}/>
          <Route path="/club/:clubId/detailsclub" element={<ClubDetails/>}/>
          <Route path="/club/:clubId/memberadmin" element={<MemberAdmin/>} />
          <Route path="/memberadmin/:memberadminId" element={<MemberAdminProfil/>} />
          <Route path="/club/:clubId/historiquepaiement" element={<PaiementClub/>}/>
          <Route path="/joueurs" element={<ListJoueur/>}/>
          <Route path="/parametre" element={<ParametrePage/>}/>
       
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
