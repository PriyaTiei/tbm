import React from 'react';
import JudgementHistoryData from './JudgementHistoryData';

const JudgementHistoryPage = () => {
  return (
    <div className="container-fluid px-3 px-md-4 py-3" style={{ minHeight: "85vh" }}>
      <JudgementHistoryData byData="yes" />
    </div>
  );
};

export default JudgementHistoryPage;
