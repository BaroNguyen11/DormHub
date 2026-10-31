import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext.jsx'
import './App.css'

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}
 
