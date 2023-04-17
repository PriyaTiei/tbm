import React from "react";

// import MachineList from "./components/MachineList";
import {  Routes, Route } from "react-router-dom";
import Title from "./components/Title";
import SmileCard from "./components/SmileCard";
import { Provider } from "react-redux";
import { store } from "./store";
import Machines from "./components/Machines";
import Filters from "./components/Filters";
import Card from "./components/RaiseCard";
import Login from "./components/Login";
import AbnormalityRecord from "./components/AbnormalityRecord";
import SummaryAbnormality from "./components/SummaryAbnormality";
import AllCard from "./components/AllCard"
import SummaryCard from "./components/SummaryCard";
import SmileCardAdd from "./components/SmileCardAdd";
import PendingTask from "./components/PendingTask/PendingTask";
import TeamLeader from "./components/TeamLeader"
import PendingSmileCard from "./components/PendingTask/PendingSmileCard"
import { AppSidebar } from "./components/Sidebar";

function App() {
  return (
    <Provider store={store}>
      <AppSidebar>  
       
        <Title />
        <Filters />
        <Routes>
          <Route path="/" element={<Machines />} />
          <Route path="/checkList" element={<SmileCard />} />
          <Route path="/pendingTasks" element={<PendingTask />} />
          <Route path="/pendingTasks/cardDetails:data" element={PendingSmileCard}></Route>
          <Route path="/card" element={<Card />} />
          <Route path="/login" element={<Login />} />
          <Route path="/abnormality" element={<AbnormalityRecord />} />
          <Route path="/summaryAbnormality" element={<SummaryAbnormality />} />
          <Route path="/summaryCards" element={<SummaryCard />} />
          <Route path="/addCheckItems" element={<SmileCardAdd />} />
          <Route path="/allCards" element={<AllCard />} />
          <Route path="/teamleader" element={<TeamLeader />} />
        </Routes>
       
      </AppSidebar>
    </Provider>
  );
}

export default App;
