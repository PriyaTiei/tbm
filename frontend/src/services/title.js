export function getTitle(pathname) {
  switch (pathname) {
    case "/":
      return "Home";
    case "/pendingTasks":
      return "Pending Tasks"; 
    case "/checkList":
      return "Card Details";
    case "/allMachine/cardDetails/":
      return "Card Details";
    case "/allMachine":
      return "All Cards";
    case "/delMachine":
      return "Deleted Cards";
    case "/overallStatus":
      return "TBM Overall Status";
    case "/pendingTasks/cardDetails/":
      return "Pending Card Details";
    case "/summaryAbnormality":
      return "Abnormalities by Member";
    case "/summaryCards":
      return "Actual Abnormalities";
    case "/addCheckItems":
      return "Add CheckItems";
    case "/holidays":
      return "Holiday List";
    case "/verification":
      return "TL/GL Verification";
    case "/judgementHistory":
      return "Judgement History";
    default:
      return "Home";
  }
}

export function getSection(pathname) {
  // Return "TBM" for both Maintenance and Production so header consistently shows GD_TBM
  return "TBM";
}
