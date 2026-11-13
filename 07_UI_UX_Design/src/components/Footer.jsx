import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <ul className="footer-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/storages">Cold Storages</Link></li>
          <li><Link to="/schemes">Govt Schemes</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
        <p>
          <strong>Crop Storage and Farmer Assistance Platform</strong> -
          college innovation competition project.
        </p>
        <p>
          Storage listings are sample data for the competition and may not
          match real facilities. Please confirm availability and prices
          directly with the storage before relying on them.
        </p>
      </div>
    </footer>
  );
}

export default Footer;