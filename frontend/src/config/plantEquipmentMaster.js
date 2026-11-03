/**
 * Master mapping of Plants to Equipments for Utility and Facility
 * Derived from 'FACILITY UTILITY DATA.xlsx'
 * Ensures filters are always populated immediately on page load,
 * regardless of schedule date or API loading state.
 */

export const UTILITY_MASTER_MAP = {
  "66KV Sub station": [
    "110 DC battery",
    "11kV VCB",
    "CT & PT",
    "DCDB",
    "Earth pit",
    "Energy meter and relay",
    "GOS",
    "H T Breaker (SF6 breaker)",
    "HT Panel and C&R panel",
    "KPTCL area GOS & SF6 breaker",
    "Painting",
    "Transformer 10 MVA",
    "UG cable"
  ],
  "Engine": [
    "3KVA & 1KVA",
    "500kVA",
    "AHU",
    "CENTRALIZED AC (INDOOR AND OUT DOOR UNITS)",
    "DG 2000 Kva",
    "DRY TRANSFORMER 500 kVA",
    "EARTH RESISTANCE & PIT CONDITION CHECK",
    "ENGINE UPS ROOM AC",
    "EXHAUST & FRESH AIR FANS SERVICE",
    "HYBRID SOLAR",
    "LDB & PDB",
    "LIGHTS & FANS",
    "LT PANEL & BREAKERS",
    "PANEL ROOM (Meter & relay Calibration)",
    "Pipe line Visual checking",
    "SPLIT A/C",
    "STORAGE LICENCE RENEWAL",
    "THERMODYNAMIC WATER HEATER",
    "TRANSFER PUMP",
    "TRANSFORMER   2500 kVA (Oil Filtration)",
    "UNLOADING PUMP",
    "UPS ROOM  BATTERY AC"
  ],
  "Common": [
    "AIR BLOWER BELT REPLACEMENT",
    "AIR BLOWER SERVICING ACTIVITY",
    "AIR BLOWER SUCTION FILTER CHECKING & CLEANING",
    "AIR BLOWER SUCTION FILTER CLEANING",
    "AIR BLOWER SUCTION FILTER REPLACEMENT",
    "AIR QUALITY CHECK Auto & Engine",
    "ALL MOTORS PM WORK",
    "ALL PUMPS AND MOTORS SERVICE ACTIVITY",
    "ALL PUMPS PM WORK",
    "All MOTORS PM WORK",
    "All PUMPS PM WORK",
    "CATRIDGE FILTERS REPLACEMENT ACTIVITY",
    "CLOSE LOOP UG SUMP",
    "COD INSTRUMENT HEATING BLOCK (Calibration)",
    "COMPRESSOR EFFICIENCY CHECK Auto & Engine",
    "COMPRESSOR OIL REPLACEMENT",
    "COMPRESSOR PANEL",
    "COMPRESSORS  (1050 cfm)",
    "COURSE BUBBLE DIFFUSERS REPLACEMENT",
    "Chip compact m/c",
    "DESCALING ACTIVITY",
    "DIESPRAY TANK CLEANING WORK",
    "DOSING TANK CLEANING ACTIVITY",
    "DRINKING WATER PIPELINE DISINFECTION PROCESS",
    "DRINKING WATER QUALITY ANALYSIS BY EXTERNAL LAB",
    "DRUM EVAPORATOR DRUM REPLACEMENT",
    "DRYERS",
    "EQUALISATION TANK I & II  CLEANONG",
    "ETP 2 TREATED WATER QUALITY ANALYSIS BY EXTERNAL LAB",
    "FINAL TREATED WATER TANK CLEANING",
    "FINE BUBBLE DIFFUSERS REPLACEMENT",
    "FLUSHING OHT CLEANING WORK",
    "FORKLIFT",
    "Hydro lift",
    "ISO BUTANE GAS DETECTOR SERVICE ACTIVITY",
    "MULTIGAS DETECTOR",
    "OIL & GREASE TANK CLEANING",
    "OPEN LOOP UG SUMP",
    "PAINTING AT ETP II AREA",
    "PAINTING AT STP AREA",
    "PNG CUBICAL",
    "POND WATER STORAGE TANK CLEANING AT DOCK 1",
    "POND WATER STORAGE TANK CLEANING AT DOCK 3",
    "PRESSURE GAUGE CALIBRATION",
    "PSF & ACF FILTERS MEDIA (PEBBLES,SAND & ACTIVATED CARBON) REPLACEMENT",
    "PSF FILTERS MEDIA (PEBBLES &SAND) REPLACEMENT ACTIVITY",
    "PUMP OIL REPLACEMENT",
    "Pipe line Nitrogen pressure checking",
    "Pipe line Visual checking",
    "RAIN WATER POND CLEANING WORK",
    "RAW WATER TRANSFER PUMPS PM WORK",
    "REGENERATION TANK CLEANING ACTIVITY",
    "RO CATRIDGE FILTERS CLEANING ACTIVITY",
    "RO CATRIDGE FILTERS REPLACEMENT ACTIVITY",
    "RO MEMBRANE CHEMICAL CLEANING WORK",
    "RO MEMBRENE REPLACEMENT",
    "SCADA AMC",
    "SLUDGE BED MEDIA REPLACEMENT WORK",
    "SOFTENER MEDIA REPLACEMENT ACTIVITY",
    "STP TREATED WATER QUALITY ANALYSIS BY EXTERNAL LAB",
    "TANK CLEANING ACTIVITY",
    "THERMIC FLUID HEATER SERVICE ACTIVITY",
    "THERMIC FLUID OIL TOPUP ACTIVITY",
    "TRANSFER PUMP",
    "UF BAG FILTERS CLEANING ACTIVITY",
    "UF BAG FILTERS REPLACEMENT ACTIVITY",
    "UF MEMBRANE CHEMICAL CLEANING WORK",
    "UF MEMBRENE REPLACEMENT",
    "UG SUMP TANK CLEANING WORK",
    "UNLOADING PUMP",
    "UV LIGHT REPLACEMENT",
    "UV LIGHT REPLACEMENT AT DRINKING WATER BOTTLING SECTION",
    "UV LIGHT REPLACEMENT AT DRINKING WATER STORAGE TANK OUTLET",
    "WEIGHING BALANCE",
    "WEIGHING BALANCE (Calibration)",
    "ZLD FEED TANK CLEANING ACTIVITY"
  ],
  "GD": [
    "Chiller",
    "Cooling tower",
    "DOSING TANK CLEANING ACTIVITY",
    "ENG PANELS",
    "PSF & ACF FILTERS MEDIA (PEBBLES,SAND & ACTIVATED CARBON) REPLACEMENT",
    "Pump house",
    "RO CATRIDGE FILTERS CLEANING ACTIVITY",
    "RO CATRIDGE FILTERS REPLACEMENT ACTIVITY",
    "RO MEMBRANE CHEMICAL CLEANING WORK",
    "RO MEMBRENE REPLACEMENT",
    "RO OHT CLEANING ACTIVITY",
    "UV LIGHT REPLACEMENT AT RO WATER STORAGE TANK OUTLET"
  ],
  "QC": [
    "DOSING TANK CLEANING ACTIVITY",
    "PSF & ACF FILTERS MEDIA (PEBBLES,SAND & ACTIVATED CARBON) REPLACEMENT",
    "RO CATRIDGE FILTERS CLEANING ACTIVITY",
    "RO CATRIDGE FILTERS REPLACEMENT ACTIVITY",
    "RO MEMBRANE CHEMICAL CLEANING WORK",
    "RO MEMBRENE REPLACEMENT",
    "RO WATER STORAGE TANK CLEANING ACTIVITY"
  ],
  "TNGA": [
    "DRY TRANSFORMER 500 kVA",
    "LT PANEL & BREAKERS"
  ],
  "TNGA/DC": [
    "COMPRESSORS"
  ]
};

export const FACILITY_MASTER_MAP = {
  "Hydrant System -old line": ["All Area"],
  "Hydrant System -New line": ["All Area"],
  "Fire Alarm System (Safety devices)": ["All Area"],
  "General Facility": ["All Area"],
  "New ware house": ["Inspection area, Packing area, Forklift Maintenance, Area, All group room area, Loading & Unloading area,"],
  "TNGA M/c & Mnt": ["QC, MNT, & DC office, Oil storage area, Machining area"],
  "TNGA Assy": ["Assy group room area, All windows, MNT group room area, Test bench area"],
  "GD M/c, QC, GD Assy, Outside window": ["GD Head, Crank, Block, 4C area,QC Area, Groop rooms, GD Assy, Compressor room, Test bench."],
  "66KV,Utility, Vikasana Kendra, value yard": ["66Kv panel board, Battery & Groop room, Dry transformer area, Vikasana Kendra inside, Group room, OHC, Value yard inside, Hazardous room outside, Utility DG & Pannel board area"],
  "Old ware house": ["Material storage area, QC RI area, Vendor parts check area, Groop room area"],
  "GD LOG, GPS, GD Mnt, Compressor": ["Dry Transformer area, GPS inside & group room area, MNT area, oil storage area, Log material storage area, FG Engine storage area, MES area"],
  "ZLD, ETP, STP, UG sump": ["ZLD inside & Group room area, STP, ETP inside, Chemical storage & Lab area, ETP bed area, UG Sump inside"],
  "TNGA (M) Log": ["Log material storage area, Bin washing area, Group room area"],
  "TNGA Assy log": ["Truck loading & Unloading area, FG engine storage area, Pallet repair area, Dock 1 inside"],
  "DC Prod, Block line, Kaizen": ["DMNT, Ingot room, Pannel board area, All windows, Bird net dust cleaning"],
  "Admin &  TNGA Assy": ["From Dock - 03  to Vakasana kendra"],
  "TNGA M/C": ["From UG sump to STP"],
  "DC Production": ["From 66KV to STP"],
  "Car Parking": ["From Dock - 02  to  STP"],
  "RECEPTION": ["RECEPTION OFFICE, ALL MEETING ROOMS.", "Room number EC4, Reception passage (AFC),Reception passage meeting room,Seminar hall,Seminar hall (AFC),Board room,Reception,"],
  "CANTEEN & KITCHEN": ["ALL AREA"],
  "COMPRESSOR ROOM": ["GROUP ROOM, BATTERY ROOM, PANNEL ROOM"],
  "UTILITY": ["BATTERY ROOM, PANNEL ROOM,DG AREA, VALUE YARD, HAZARDOUS"],
  "DEVELOPMENT CENTER": ["DEVELOPMENT CENTER, MEDICAL CENTER"],
  "CORPORATE OFFICE": ["AC ROOM, BOARD ROOM, MD CABIN, DOCUMENT ROOM"],
  "PRODUCTION OFFICE": ["WASHROOM PASSAGE, DMD CABIN, MEETING ROOMS."],
  "GD ASSY & MACHINING": ["QC, 4C AREA GPS, MNT, MACHINING AREA, GD ASSY, GROUP ROOMS."],
  "TNGA Assy & log": ["TNGA ASSY, LOG, MNT, LOADING & UNLOADING"],
  "OLD WARE HOUSE": ["SHOPFLOOR & CANTEEN"],
  "TNGA Machining & Dc area": ["All Area", "All Machining area, log area, DC prod, Kaizen, Oil storage area, Ingot storage area,"],
  "GD Assy, GD Machining area": ["All Area", "GD machining area, QC area, MNT area, GPS, GD log, GD Assy,"],
  "TNGA ASSY, Old & New warehouse": ["TNGA Assy, TNGA Log, Utility, Old ware house inside area"],
  "TNGA Assy,Old & New warehouse": ["All Area"]
};

export function getActivePlantInfo() {
  const envPlant = (process.env.REACT_APP_PLANT || "").toUpperCase();
  let plant = "TNGA";

  if (envPlant.includes("UTIL")) {
    plant = "UTILITY";
  } else if (envPlant.includes("FACIL")) {
    plant = "FACILITY";
  } else if (envPlant.includes("GD")) {
    plant = "GD";
  } else if (envPlant.includes("TNGA")) {
    plant = "TNGA";
  } else {
    // Port-based fallback
    const backendPort = String(process.env.REACT_APP_PORT || "");
    const frontendPort = typeof window !== "undefined" && window.location ? String(window.location.port || "") : "";

    if (backendPort === "5082" || frontendPort === "5072") {
      plant = "UTILITY";
    } else if (backendPort === "5083" || backendPort === "5091" || frontendPort === "3003") {
      plant = "FACILITY";
    } else if (backendPort === "5051" || frontendPort === "3000") {
      plant = "GD";
    } else {
      plant = "TNGA";
    }
  }

  const isUtility = plant === "UTILITY";
  const isFacility = plant === "FACILITY";
  const isUtilityOrFacility = isUtility || isFacility;
  const masterMap = isUtility ? UTILITY_MASTER_MAP : isFacility ? FACILITY_MASTER_MAP : null;

  return {
    plant,
    isUtility,
    isFacility,
    isUtilityOrFacility,
    masterMap,
  };
}
