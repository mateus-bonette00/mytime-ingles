import './Footer.css';
import Icons from './Icons';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <h3 className="footer-brand">Inglês na Mala | com Teacher Ediane</h3>

          <nav className="footer-links">
            <a href="/privacy">Política de Privacidade</a>
            <a href="/terms">Termos de Uso</a>
            <a href="/contact">Contato</a>
          </nav>

          <div className="footer-social">
            <a href="#" aria-label="Facebook" className="social-link">
              <Icons.Facebook />
            </a>
            <a href="#" aria-label="Instagram" className="social-link">
              <Icons.Instagram />
            </a>
            <a href="#" aria-label="YouTube" className="social-link">
              <Icons.YouTube />
            </a>
          </div>

          <p className="footer-copyright">
            © {new Date().getFullYear()} Inglês na Mala | Teacher Ediane. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
