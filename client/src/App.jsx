import './App.css'
import './styles/CustomScrollbar.css'
import './styles/search.css'
import AppRoutes from './Routes.jsx'
import ChatNotification from './components/chat/ChatNotification'
import ChatSoundNotification from './components/chat/ChatSoundNotification'
import ChatConnectionProvider from './components/ChatConnectionProvider'
import ConnectionStatus from './components/ConnectionStatus'
import { useSelector } from 'react-redux'
import { isAuthenticated } from './redux/auth/selectors'

function App() {
  const authenticated = useSelector(isAuthenticated);

  return (
    <ChatConnectionProvider>
      <AppRoutes />
      {authenticated && (
        <>
          <ChatNotification />
          <ChatSoundNotification />
          <ConnectionStatus />
        </>
      )}
    </ChatConnectionProvider>
  )
}

export default App
