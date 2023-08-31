import {Image} from 'react-bootstrap';
import "./HomePage.css"
import joueur from "../images/competition.jpg"
import club from "../images/club.jpg"
import arbitre from "../images/arbitre.png"
import { Link } from 'react-router-dom';
import SideBar from '../Components/SideBar';
const HomePage = () =>{

    return (
        <div className='homecontient'>
           <SideBar/>
          
           <div className="cards">
  <div className="card">
    <Link to="/club">
      <div
        className="card-content"
        style={{
          backgroundImage: `url(${club})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        Clubs
      </div>
    </Link>
  </div>

  <div className="card">
    <Link to="/arbitre">
      <div
        className="card-content"
        style={{
          backgroundImage: `url(${arbitre})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        Arbitres
      </div>
    </Link>
  </div>

  <div className="card">
    <Link to="/joueurs">
      <div
        className="card-content"
        style={{
          backgroundImage: `url(${joueur})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        Joueurs
      </div>
    </Link>
  </div>
</div>

        </div>
    )
}
export default HomePage;