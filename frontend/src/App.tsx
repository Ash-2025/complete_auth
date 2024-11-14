import { Route, Routes } from 'react-router-dom'
import AuthComponent from '@/components/AuthComponent'
function App() {

  return (
     <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/auth' element={<AuthComponent/>} />
     </Routes>
  )
}
const Home = () => {
  return (
    <>
      Hello
    </>
  )
}
export default App
