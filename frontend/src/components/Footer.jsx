import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer" id="contact">
    <div className="container">
      <div className="footer__grid">
        <div>
          <div className="footer__brand-name"><span>📱</span> CellShop</div>
          <p className="footer__brand-desc">
            Your trusted source for brand new, second-hand, and ref unit cellphones
            in the Philippines. All units come with warranty.
          </p>
        </div>

        <div>
          <p className="footer__heading">Quick Links</p>
          <div className="footer__links">
            <Link to="/" className="footer__link">Home</Link>
            <Link to="/shop" className="footer__link">Shop</Link>
            <Link to="/shop?type=new" className="footer__link">Brand New</Link>
            <Link to="/shop?type=secondhand" className="footer__link">Ref Units</Link>
            <Link to="/shop?type=accessory" className="footer__link">Accessories</Link>
          </div>
        </div>

        <div>
          <p className="footer__heading">Policies</p>
          <div className="footer__links">
            <a href="#" className="footer__link">Warranty Policy</a>
            <a href="#" className="footer__link">Delivery Policy</a>
            <a href="#" className="footer__link">Return Policy</a>
            <a href="#" className="footer__link">Privacy Policy</a>
          </div>
        </div>

        <div id="about">
          <p className="footer__heading">Contact Us</p>
          <div className="footer__contact-item"><span className="footer__contact-icon">📘</span><span>facebook.com/CellShopPH</span></div>
          <div className="footer__contact-item"><span className="footer__contact-icon">✉️</span><span>hello@cellshop.ph</span></div>
          <div className="footer__contact-item"><span className="footer__contact-icon">📞</span><span>+63 900 000 0000</span></div>
          <div className="footer__contact-item"><span className="footer__contact-icon">📍</span><span>Metro Manila, Philippines</span></div>
        </div>
      </div>

      <div className="footer__bottom">
        <span className="footer__copyright">© {new Date().getFullYear()} CellShop. All rights reserved.</span>
        <span className="footer__copyright">Delivery areas: Metro Manila + selected provinces</span>
      </div>
    </div>
  </footer>
);

export default Footer;
