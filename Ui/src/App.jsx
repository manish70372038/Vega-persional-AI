import { Routes, Route, Navigate } from "react-router-dom";
import Profile, { Login, Sigh } from "./Components/Auth.page.jsx";
import Home from "./Components/Home.jsx";
import Mainpage from "./Components/Dashboard.jsx";
import useUser from "./Components/userdata.jsx";

 



function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/signup" element={useUser?<Navigate to="/Dashboard"/>:<Sigh/>}/>
      <Route path="/login" element={useUser?<Navigate to="/Dashboard"/>:<Login/>}/>
      <Route path="/profile" element={<Profile/>} />
      <Route path="/Dashboard" element={<Mainpage/>}/>
    </Routes>
  );
}
export default App;
