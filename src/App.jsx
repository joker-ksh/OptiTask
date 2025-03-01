import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './comps/Landing/Landing'
import ManagerSignUp from './comps/Auth/ManagerSignUp'
import DeveloperSignUp from './comps/Auth/DeveloperSignUp'
import Developerdash from './comps/Dashboard/Developerdash'
import Managerdash from './comps/Dashboard/Managerdash'
import Task from './comps/Dashboard/Task'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/managerSignUp' element={<ManagerSignUp />} />
        <Route path='/DeveloperSignUp' element={<DeveloperSignUp />} />
        <Route path='/managerdash' element={<Managerdash />} />
        <Route path='/developerdash' element={<Developerdash />} />
        <Route path='/task' element={<Task />} />
      </Routes>
    </Router>
  )
}

export default App
