import '../styles/Modal.css'



const Modal = ({onClose}) => {

  const handleGitHub = () => {
    window.open('https://github.com/Yisca1234/EchoShareWebsite/tree/master', '_blank');
  }
  const handleLinkedin = () => {
    window.open('https://www.linkedin.com/in/yisca-grossman-67a202259/', '_blank');
  }
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>About This Website</h2>
        <strong>Welcome to Echoshare!</strong>
        <p>This social media website <strong>(just for computers at the moment)</strong> was crafted from scratch to showcase my development skills. Leveraging the power of React for the client side, Node.js for the server, and MongoDB as the database, Echoshare demonstrates my ability to build a comprehensive web application. In addition to these technologies, I utilized many more advanced tools and techniques for robust authorization, authentication, and security.</p>
        <p>This is the first version of Echoshare, with all data manually entered by me. I would be delighted if you could help bring this website to life by creating an account, starting a channel, and uploading posts. Your contributions will enrich this project and highlight its potential.</p>
        <p>The code is available on <strong className='text4' onClick={handleGitHub}>GitHub</strong> . For any questions or feedback, please feel free to reach out to me via <strong className='text4' onClick={handleLinkedin}>LinkedIn</strong> or email: gyisca@gmail.com</p>
        <p>Thank you for exploring Echoshare!</p>
        <button onClick={()=>onClose(1)}>Got It!</button>
        <button onClick={()=>onClose(2)}>I want to see it in another time</button>
      </div>
    </div>
  );
};

export default Modal;
