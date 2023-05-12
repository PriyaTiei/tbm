import React , {useEffect} from "react"; 
import {  useDispatch } from 'react-redux';
import {  Routes, Route } from "react-router-dom";
import Title from "./components/Title";
import SmileCard from "./components/SmileCard";  
import Machines from "./components/Machines";
import Filters from "./components/Filters";
import Card from "./components/RaiseCard"; 
import AbnormalityRecord from "./components/AbnormalityRecord";
import SummaryAbnormality from "./components/SummaryAbnormality"; 
import SummaryCard from "./components/SummaryCard";
import SmileCardAdd from "./components/SmileCardAdd";
import PendingTask from "./components/PendingTask/PendingTask";
import TeamLeader from "./components/TeamLeader/TeamLeader"
import PendingSmileCard from "./components/PendingTask/PendingSmileCard"
import AllMachineSmileCard from "./components/AllMachine/AllMachineSmileCard"
import { AppSidebar } from "./components/Sidebar"; 
import AllMachine from "./components/AllMachine/AllMachine";
import { getLogin } from "./redux/login/loginActions";
import { useCookies } from "react-cookie";

function App() { 
  const dispatch = useDispatch(); 
  const [cookies] = useCookies(['token', 'role', 'name']);
  const { token, role, name } = cookies;
  console.log(token)
  useEffect(() => {     
    if (token) { 
      dispatch(getLogin(name, role, token));
    }
  }, [dispatch]);

  
  return (
    
      <AppSidebar>  
       
        <Title />
        <Filters />
        <Routes>
          <Route path="/" element={<Machines />} />
          <Route path="/checkList" element={<SmileCard />} />
          <Route path="/pendingTasks" element={<PendingTask />} />
          <Route path="/pendingTasks/cardDetails" element={<PendingSmileCard/>}></Route>
          <Route path="/allMachine/cardDetails" element={<AllMachineSmileCard/>}></Route>
          <Route path="/card" element={<Card />} /> 
          <Route path="/abnormality" element={<AbnormalityRecord />} />
          <Route path="/summaryAbnormality" element={<SummaryAbnormality />} />
          <Route path="/summaryCards" element={<SummaryCard />} />
          <Route path="/addCheckItems" element={<SmileCardAdd />} />
          <Route path="/allMachine" element={<AllMachine />} />
          <Route path="/teamleader" element={<TeamLeader />} />
        </Routes>
       
      </AppSidebar>
    
  );
}

export default App;
