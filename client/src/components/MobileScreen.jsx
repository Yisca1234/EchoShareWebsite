import '../styles/MobileScreen.css'; // Import the CSS for styling (optional)

const MobileScreen = () => {
  return (
    <div className="mobile-screen-container">
      <div className="logo">
        <img src="echoShare.png" alt="Logo" className="logo-image" />
      </div>
      <div className="message">
        <h1>Oops! 🚧</h1>
        <p className="message-text">
          This website is currently designed for computers. But don’t worry, the mobile version will come in the future!
        </p>
      </div>
    </div>
  );
};

export default MobileScreen;
