// Inspection checkpoints structured per PRD's 6-step inspection flow

export type CheckpointOption = {
  value: string;
  label: string;
  severity?: "ok" | "minor" | "major" | "critical";
};

export interface Checkpoint {
  id: string;
  question: string;
  options: CheckpointOption[];
  voicePrompt: string;
  required: boolean;
}

export interface InspectionStep {
  id: number;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  checkpoints: Checkpoint[];
}

// Step 1: Vehicle Basics - Auto-filled from vehicle lookup
export const STEP_VEHICLE_BASICS: InspectionStep = {
  id: 1,
  title: "Vehicle Basics",
  shortTitle: "Basics",
  icon: "🏍️",
  description: "Verify and confirm vehicle details",
  checkpoints: [
    {
      id: "vb_owner_name",
      question: "Owner name verified?",
      options: [
        { value: "verified", label: "Verified", severity: "ok" },
        { value: "mismatch", label: "Name mismatch", severity: "major" },
        { value: "not_available", label: "Not available", severity: "minor" },
      ],
      voicePrompt: "Confirm owner name matches documents",
      required: true,
    },
    {
      id: "vb_chassis_match",
      question: "Chassis number matches RC?",
      options: [
        { value: "matches", label: "Matches", severity: "ok" },
        { value: "mismatch", label: "Does not match", severity: "critical" },
        { value: "not_visible", label: "Not visible", severity: "major" },
      ],
      voicePrompt: "Verify chassis number matches registration certificate",
      required: true,
    },
    {
      id: "vb_engine_match",
      question: "Engine number matches RC?",
      options: [
        { value: "matches", label: "Matches", severity: "ok" },
        { value: "mismatch", label: "Does not match", severity: "critical" },
        { value: "not_visible", label: "Not visible", severity: "major" },
      ],
      voicePrompt: "Verify engine number matches registration certificate",
      required: true,
    },
    {
      id: "vb_odometer",
      question: "Odometer reading appears genuine?",
      options: [
        { value: "genuine", label: "Genuine", severity: "ok" },
        { value: "suspected_tamper", label: "Suspected tamper", severity: "critical" },
        { value: "not_working", label: "Not working", severity: "major" },
      ],
      voicePrompt: "Describe odometer condition and reading",
      required: true,
    },
  ],
};

// Step 2: Engine & Powertrain
export const STEP_ENGINE: InspectionStep = {
  id: 2,
  title: "Engine & Powertrain",
  shortTitle: "Engine",
  icon: "🔧",
  description: "Check engine condition and performance",
  checkpoints: [
    {
      id: "eng_start",
      question: "Does engine start easily?",
      options: [
        { value: "easy_start", label: "Yes, easy start", severity: "ok" },
        { value: "hard_start", label: "Hard start", severity: "minor" },
        { value: "no_start", label: "No start", severity: "critical" },
      ],
      voicePrompt: "Describe how the engine starts",
      required: true,
    },
    {
      id: "eng_idle",
      question: "Idle is stable?",
      options: [
        { value: "stable", label: "Stable idle", severity: "ok" },
        { value: "rough", label: "Rough idle", severity: "minor" },
        { value: "stalling", label: "Stalls frequently", severity: "major" },
      ],
      voicePrompt: "Describe idle quality and any fluctuations",
      required: true,
    },
    {
      id: "eng_sounds",
      question: "Unusual engine sounds?",
      options: [
        { value: "none", label: "None", severity: "ok" },
        { value: "minor", label: "Minor sounds", severity: "minor" },
        { value: "severe", label: "Severe knocking/rattling", severity: "major" },
      ],
      voicePrompt: "Describe any unusual sounds from the engine",
      required: true,
    },
    {
      id: "eng_oil",
      question: "Oil condition?",
      options: [
        { value: "clean", label: "Clean", severity: "ok" },
        { value: "dark", label: "Dark", severity: "minor" },
        { value: "milky", label: "Milky/contaminated", severity: "critical" },
        { value: "leaking", label: "Leaking", severity: "major" },
      ],
      voicePrompt: "Check and describe oil condition and level",
      required: true,
    },
    {
      id: "eng_air_filter",
      question: "Air filter condition?",
      options: [
        { value: "clean", label: "Clean", severity: "ok" },
        { value: "dusty", label: "Dusty", severity: "minor" },
        { value: "clogged", label: "Clogged", severity: "major" },
      ],
      voicePrompt: "Describe air filter condition",
      required: false,
    },
    {
      id: "eng_exhaust",
      question: "Exhaust smoke?",
      options: [
        { value: "none", label: "No smoke", severity: "ok" },
        { value: "white", label: "White smoke", severity: "minor" },
        { value: "blue", label: "Blue smoke (oil burning)", severity: "major" },
        { value: "black", label: "Black smoke", severity: "major" },
      ],
      voicePrompt: "Describe exhaust emissions and any smoke",
      required: true,
    },
    {
      id: "eng_transmission",
      question: "Gear shifting?",
      options: [
        { value: "smooth", label: "Smooth", severity: "ok" },
        { value: "rough", label: "Rough/hard", severity: "minor" },
        { value: "grinding", label: "Grinding/slipping", severity: "major" },
        { value: "automatic", label: "Automatic (CVT)", severity: "ok" },
      ],
      voicePrompt: "Describe gear shifting quality",
      required: true,
    },
  ],
};

// Step 3: Body & Paint
export const STEP_BODY: InspectionStep = {
  id: 3,
  title: "Body & Paint",
  shortTitle: "Body",
  icon: "🎨",
  description: "Inspect body panels and paint condition",
  checkpoints: [
    {
      id: "body_paint",
      question: "Overall paint condition?",
      options: [
        { value: "excellent", label: "Excellent", severity: "ok" },
        { value: "good", label: "Good", severity: "ok" },
        { value: "faded", label: "Faded", severity: "minor" },
        { value: "chipped", label: "Chipped/peeling", severity: "major" },
      ],
      voicePrompt: "Describe overall paint condition",
      required: true,
    },
    {
      id: "body_rust",
      question: "Rust spots?",
      options: [
        { value: "none", label: "None", severity: "ok" },
        { value: "minor", label: "Minor surface rust", severity: "minor" },
        { value: "major", label: "Major rust damage", severity: "major" },
      ],
      voicePrompt: "Check for rust and describe locations",
      required: true,
    },
    {
      id: "body_dents",
      question: "Dents or damage?",
      options: [
        { value: "none", label: "None", severity: "ok" },
        { value: "minor", label: "Minor dents", severity: "minor" },
        { value: "major", label: "Major dents/damage", severity: "major" },
        { value: "frame_bent", label: "Frame bent", severity: "critical" },
      ],
      voicePrompt: "Describe any dents or body damage",
      required: true,
    },
    {
      id: "body_fairing",
      question: "Fairings/panels condition?",
      options: [
        { value: "intact", label: "Intact", severity: "ok" },
        { value: "cracked", label: "Cracked", severity: "minor" },
        { value: "missing", label: "Missing pieces", severity: "major" },
        { value: "broken", label: "Broken", severity: "major" },
      ],
      voicePrompt: "Check all plastic panels and fairings",
      required: true,
    },
    {
      id: "body_seat",
      question: "Seat condition?",
      options: [
        { value: "good", label: "Good", severity: "ok" },
        { value: "worn", label: "Worn", severity: "minor" },
        { value: "torn", label: "Torn/damaged", severity: "major" },
      ],
      voicePrompt: "Describe seat condition",
      required: true,
    },
    {
      id: "body_mirrors",
      question: "Mirrors condition?",
      options: [
        { value: "both_ok", label: "Both OK", severity: "ok" },
        { value: "one_damaged", label: "One damaged", severity: "minor" },
        { value: "both_damaged", label: "Both damaged", severity: "major" },
        { value: "missing", label: "Missing", severity: "major" },
      ],
      voicePrompt: "Check both mirrors",
      required: true,
    },
  ],
};

// Step 4: Electronics & Electrics
export const STEP_ELECTRONICS: InspectionStep = {
  id: 4,
  title: "Electronics & Electrics",
  shortTitle: "Electrics",
  icon: "⚡",
  description: "Test all electrical components",
  checkpoints: [
    {
      id: "elec_headlight",
      question: "Headlight?",
      options: [
        { value: "working", label: "Working (high & low)", severity: "ok" },
        { value: "dim", label: "Dim", severity: "minor" },
        { value: "partial", label: "Only one mode works", severity: "minor" },
        { value: "not_working", label: "Not working", severity: "major" },
      ],
      voicePrompt: "Test headlight in both high and low beam",
      required: true,
    },
    {
      id: "elec_taillight",
      question: "Tail light?",
      options: [
        { value: "working", label: "Working", severity: "ok" },
        { value: "dim", label: "Dim", severity: "minor" },
        { value: "not_working", label: "Not working", severity: "major" },
      ],
      voicePrompt: "Test tail light and brake light",
      required: true,
    },
    {
      id: "elec_indicators",
      question: "Turn signals?",
      options: [
        { value: "all_working", label: "All working", severity: "ok" },
        { value: "some_fail", label: "Some not working", severity: "minor" },
        { value: "all_fail", label: "All not working", severity: "major" },
      ],
      voicePrompt: "Test all four turn signals",
      required: true,
    },
    {
      id: "elec_horn",
      question: "Horn?",
      options: [
        { value: "working", label: "Working", severity: "ok" },
        { value: "weak", label: "Weak", severity: "minor" },
        { value: "not_working", label: "Not working", severity: "major" },
      ],
      voicePrompt: "Test the horn",
      required: true,
    },
    {
      id: "elec_battery",
      question: "Battery condition?",
      options: [
        { value: "strong", label: "Strong", severity: "ok" },
        { value: "weak", label: "Weak (slow crank)", severity: "minor" },
        { value: "dead", label: "Dead/failing", severity: "major" },
      ],
      voicePrompt: "Check battery and starting power",
      required: true,
    },
    {
      id: "elec_speedo",
      question: "Speedometer/console?",
      options: [
        { value: "working", label: "Working", severity: "ok" },
        { value: "partial", label: "Partially working", severity: "minor" },
        { value: "not_working", label: "Not working", severity: "major" },
      ],
      voicePrompt: "Check speedometer and all console indicators",
      required: true,
    },
    {
      id: "elec_wiring",
      question: "Wiring harness?",
      options: [
        { value: "intact", label: "Intact", severity: "ok" },
        { value: "corroded", label: "Corroded", severity: "minor" },
        { value: "damaged", label: "Damaged/exposed", severity: "major" },
      ],
      voicePrompt: "Inspect visible wiring condition",
      required: false,
    },
  ],
};

// Step 5: Suspension & Handling
export const STEP_SUSPENSION: InspectionStep = {
  id: 5,
  title: "Suspension & Handling",
  shortTitle: "Suspension",
  icon: "🔩",
  description: "Check suspension, brakes, and tyres",
  checkpoints: [
    {
      id: "susp_front",
      question: "Front suspension?",
      options: [
        { value: "smooth", label: "Smooth", severity: "ok" },
        { value: "creaky", label: "Creaky", severity: "minor" },
        { value: "leaking", label: "Oil leaking", severity: "major" },
        { value: "seized", label: "Seized/stuck", severity: "critical" },
      ],
      voicePrompt: "Compress front suspension and describe",
      required: true,
    },
    {
      id: "susp_rear",
      question: "Rear suspension?",
      options: [
        { value: "smooth", label: "Smooth", severity: "ok" },
        { value: "creaky", label: "Creaky", severity: "minor" },
        { value: "leaking", label: "Oil leaking", severity: "major" },
        { value: "seized", label: "Seized/stuck", severity: "critical" },
      ],
      voicePrompt: "Check rear shock absorbers",
      required: true,
    },
    {
      id: "susp_front_brake",
      question: "Front brake?",
      options: [
        { value: "responsive", label: "Responsive", severity: "ok" },
        { value: "soft", label: "Soft/spongy", severity: "minor" },
        { value: "worn", label: "Worn pads", severity: "major" },
        { value: "failing", label: "Failing", severity: "critical" },
      ],
      voicePrompt: "Test front brake feel and stopping power",
      required: true,
    },
    {
      id: "susp_rear_brake",
      question: "Rear brake?",
      options: [
        { value: "responsive", label: "Responsive", severity: "ok" },
        { value: "soft", label: "Soft/spongy", severity: "minor" },
        { value: "worn", label: "Worn", severity: "major" },
        { value: "failing", label: "Failing", severity: "critical" },
      ],
      voicePrompt: "Test rear brake",
      required: true,
    },
    {
      id: "susp_steering",
      question: "Steering response?",
      options: [
        { value: "smooth", label: "Smooth", severity: "ok" },
        { value: "tight", label: "Tight", severity: "minor" },
        { value: "loose", label: "Loose/play", severity: "major" },
      ],
      voicePrompt: "Move handlebars and check steering smoothness",
      required: true,
    },
    {
      id: "susp_front_tyre",
      question: "Front tyre condition?",
      options: [
        { value: "good", label: "Good tread", severity: "ok" },
        { value: "worn", label: "Worn", severity: "minor" },
        { value: "bald", label: "Bald/unsafe", severity: "critical" },
        { value: "punctured", label: "Punctured", severity: "major" },
      ],
      voicePrompt: "Check front tyre tread depth and condition",
      required: true,
    },
    {
      id: "susp_rear_tyre",
      question: "Rear tyre condition?",
      options: [
        { value: "good", label: "Good tread", severity: "ok" },
        { value: "worn", label: "Worn", severity: "minor" },
        { value: "bald", label: "Bald/unsafe", severity: "critical" },
        { value: "punctured", label: "Punctured", severity: "major" },
      ],
      voicePrompt: "Check rear tyre tread depth and condition",
      required: true,
    },
  ],
};

// Step 6: Summary & Documents
export const STEP_SUMMARY: InspectionStep = {
  id: 6,
  title: "Summary & Documents",
  shortTitle: "Summary",
  icon: "📋",
  description: "Review inspection and verify documents",
  checkpoints: [
    {
      id: "doc_rc",
      question: "Registration Certificate (RC)?",
      options: [
        { value: "present_valid", label: "Present & Valid", severity: "ok" },
        { value: "present_expired", label: "Present but expired", severity: "minor" },
        { value: "absent", label: "Not available", severity: "major" },
      ],
      voicePrompt: "Verify RC is present and valid",
      required: true,
    },
    {
      id: "doc_insurance",
      question: "Insurance?",
      options: [
        { value: "valid", label: "Valid", severity: "ok" },
        { value: "expired", label: "Expired", severity: "minor" },
        { value: "absent", label: "Not available", severity: "major" },
      ],
      voicePrompt: "Check insurance validity",
      required: true,
    },
    {
      id: "doc_pollution",
      question: "Pollution certificate (PUC)?",
      options: [
        { value: "valid", label: "Valid", severity: "ok" },
        { value: "expired", label: "Expired", severity: "minor" },
        { value: "absent", label: "Not available", severity: "minor" },
      ],
      voicePrompt: "Check PUC validity",
      required: true,
    },
    {
      id: "doc_loan",
      question: "Loan/Hypothecation status?",
      options: [
        { value: "clear", label: "Clear/No loan", severity: "ok" },
        { value: "in_loan", label: "In loan (NOC needed)", severity: "minor" },
        { value: "noc_available", label: "NOC available", severity: "ok" },
      ],
      voicePrompt: "Check if vehicle has any outstanding loan",
      required: true,
    },
    {
      id: "doc_challans",
      question: "Traffic challans?",
      options: [
        { value: "none", label: "None pending", severity: "ok" },
        { value: "few", label: "1-5 pending", severity: "minor" },
        { value: "many", label: ">5 pending", severity: "major" },
      ],
      voicePrompt: "Check for pending traffic challans",
      required: false,
    },
    {
      id: "overall_grade",
      question: "Overall condition grade?",
      options: [
        { value: "A", label: "A - Excellent", severity: "ok" },
        { value: "B", label: "B - Good", severity: "ok" },
        { value: "C", label: "C - Average", severity: "minor" },
        { value: "D", label: "D - Below Average", severity: "major" },
        { value: "E", label: "E - Poor", severity: "critical" },
      ],
      voicePrompt: "Provide overall assessment of vehicle condition",
      required: true,
    },
  ],
};

// All inspection steps in order
export const INSPECTION_STEPS: InspectionStep[] = [
  STEP_VEHICLE_BASICS,
  STEP_ENGINE,
  STEP_BODY,
  STEP_ELECTRONICS,
  STEP_SUSPENSION,
  STEP_SUMMARY,
];

// Total checkpoints count
export const TOTAL_CHECKPOINTS = INSPECTION_STEPS.reduce(
  (acc, step) => acc + step.checkpoints.length,
  0
);

// Get step by ID
export function getStepById(stepId: number): InspectionStep | undefined {
  return INSPECTION_STEPS.find((s) => s.id === stepId);
}

// Calculate completion percentage
export function calculateStepCompletion(
  stepId: number,
  responses: Record<string, string>
): number {
  const step = getStepById(stepId);
  if (!step) return 0;

  const requiredCheckpoints = step.checkpoints.filter((c) => c.required);
  const completedRequired = requiredCheckpoints.filter(
    (c) => responses[c.id] !== undefined
  );

  return Math.round((completedRequired.length / requiredCheckpoints.length) * 100);
}

// Calculate overall inspection completion
export function calculateOverallCompletion(
  responses: Record<string, string>
): number {
  const allRequired = INSPECTION_STEPS.flatMap((s) =>
    s.checkpoints.filter((c) => c.required)
  );
  const completed = allRequired.filter((c) => responses[c.id] !== undefined);

  return Math.round((completed.length / allRequired.length) * 100);
}
