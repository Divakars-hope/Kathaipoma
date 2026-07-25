export type ModuleId = 'breast-cancer' | 'pcos' | 'menopause'

export interface QuestionOption {
  value: string
  labelEn: string
  labelTa: string
  /** Contribution to the risk score, 0 = no added risk */
  score: number
  /** If true, this single answer triggers the emergency warning card */
  emergency?: boolean
}

export interface Question {
  id: string
  textEn: string
  textTa: string
  options: QuestionOption[]
}

export interface ModuleDefinition {
  id: ModuleId
  titleEn: string
  titleTa: string
  questions: Question[]
}

/**
 * This file is intentionally a plain, well-typed data structure (not hardcoded
 * into JSX) so a clinician/domain expert can update questions, wording, or
 * scoring without touching any component code — see README "Editing the
 * question bank".
 */
const yesNoUnsure = (
  yesScore: number,
  noScore = 0,
  emergency = false
): QuestionOption[] => [
  { value: 'yes', labelEn: 'Yes', labelTa: 'ஆம்', score: yesScore, emergency },
  { value: 'no', labelEn: 'No', labelTa: 'இல்லை', score: noScore },
  { value: 'unsure', labelEn: 'Not sure', labelTa: 'உறுதியாக தெரியவில்லை', score: Math.round(yesScore / 2) }
]

export const MODULES: Record<ModuleId, ModuleDefinition> = {
  'breast-cancer': {
    id: 'breast-cancer',
    titleEn: 'Breast Cancer Awareness Screening',
    titleTa: 'மார்பக புற்றுநோய் விழிப்புணர்வு பரிசோதனை',
    questions: [
      {
        id: 'age',
        textEn: 'What is your age group?',
        textTa: 'உங்கள் வயது வரம்பு என்ன?',
        options: [
          { value: 'under30', labelEn: 'Under 30', labelTa: '30க்கு கீழ்', score: 2 },
          { value: '30to45', labelEn: '30–45', labelTa: '30–45', score: 5 },
          { value: 'over45', labelEn: 'Above 45', labelTa: '45க்கு மேல்', score: 9 }
        ]
      },
      {
        id: 'familyHistory',
        textEn: 'Has anyone in your close family had breast or ovarian cancer?',
        textTa: 'உங்கள் நெருங்கிய குடும்பத்தில் யாருக்காவது மார்பக அல்லது கருப்பை புற்றுநோய் இருந்ததா?',
        options: yesNoUnsure(15)
      },
      {
        id: 'lump',
        textEn: 'Have you noticed a new lump or thickening in your breast or underarm?',
        textTa: 'உங்கள் மார்பகத்தில் அல்லது அக்குள் பகுதியில் புதிய கட்டி அல்லது தடிப்பை கவனித்தீர்களா?',
        options: yesNoUnsure(20, 0, true)
      },
      {
        id: 'dischargeOrSkin',
        textEn: 'Any unusual nipple discharge, or skin changes like dimpling or redness?',
        textTa: 'மார்பக முனையில் வழக்கத்திற்கு மாறான வெளியேற்றம் அல்லது சருமத்தில் மாற்றங்கள் (பள்ளம் விழுதல், சிவப்பு) உள்ளதா?',
        options: yesNoUnsure(18)
      },
      {
        id: 'pain',
        textEn: 'Persistent pain or swelling in the breast that does not go away?',
        textTa: 'மார்பகத்தில் நீங்காத வலி அல்லது வீக்கம் உள்ளதா?',
        options: yesNoUnsure(10)
      },
      {
        id: 'previousBiopsy',
        textEn: 'Have you had a previous breast biopsy?',
        textTa: 'முன்பு மார்பக பயாப்சி செய்திருக்கிறீர்களா?',
        options: yesNoUnsure(6)
      },
      {
        id: 'hormonalMeds',
        textEn: 'Are you currently on long-term hormonal medicines (including birth control)?',
        textTa: 'தற்போது நீண்டகால ஹார்மோன் மருந்துகளை (கருத்தடை மாத்திரைகள் உட்பட) எடுத்துக்கொள்கிறீர்களா?',
        options: yesNoUnsure(4)
      },
      {
        id: 'lifestyle',
        textEn: 'Do you regularly consume alcohol or smoke?',
        textTa: 'நீங்கள் தவறாமல் மது அருந்துகிறீர்களா அல்லது புகைபிடிக்கிறீர்களா?',
        options: yesNoUnsure(5)
      },
      {
        id: 'exercise',
        textEn: 'Do you exercise at least 3 times a week?',
        textTa: 'வாரத்திற்கு குறைந்தது 3 முறை உடற்பயிற்சி செய்கிறீர்களா?',
        options: [
          { value: 'yes', labelEn: 'Yes', labelTa: 'ஆம்', score: 0 },
          { value: 'no', labelEn: 'No', labelTa: 'இல்லை', score: 4 }
        ]
      }
    ]
  },
  pcos: {
    id: 'pcos',
    titleEn: 'PCOS Screening',
    titleTa: 'PCOS பரிசோதனை',
    questions: [
      {
        id: 'periods',
        textEn: 'Are your periods irregular or do they sometimes skip months?',
        textTa: 'உங்கள் மாதவிடாய் ஒழுங்கற்றதா அல்லது சில மாதங்கள் தவறுகிறதா?',
        options: yesNoUnsure(16)
      },
      {
        id: 'weight',
        textEn: 'Have you had sudden or unexplained weight gain?',
        textTa: 'திடீரென்று அல்லது காரணமின்றி எடை அதிகரிப்பு ஏற்பட்டதா?',
        options: yesNoUnsure(10)
      },
      {
        id: 'hairGrowth',
        textEn: 'Excess hair growth on face, chest, or back?',
        textTa: 'முகம், மார்பு அல்லது முதுகில் அதிக முடி வளர்ச்சி உள்ளதா?',
        options: yesNoUnsure(14)
      },
      {
        id: 'acne',
        textEn: 'Persistent acne that does not respond to usual skincare?',
        textTa: 'வழக்கமான சருமப் பராமரிப்புக்கு பதிலளிக்காத தொடர்ச்சியான முகப்பரு உள்ளதா?',
        options: yesNoUnsure(8)
      },
      {
        id: 'infertility',
        textEn: 'Difficulty conceiving, if you have been trying?',
        textTa: 'நீங்கள் முயற்சி செய்திருந்தால், கருத்தரிப்பதில் சிரமம் உள்ளதா?',
        options: yesNoUnsure(12)
      },
      {
        id: 'sugarCraving',
        textEn: 'Frequent sugar cravings or fatigue after meals?',
        textTa: 'அடிக்கடி இனிப்பு தேவை அல்லது சாப்பிட்ட பிறகு சோர்வு ஏற்படுகிறதா?',
        options: yesNoUnsure(6)
      },
      {
        id: 'sleepStress',
        textEn: 'Poor sleep or high stress most days?',
        textTa: 'பெரும்பாலான நாட்களில் மோசமான தூக்கம் அல்லது அதிக மன அழுத்தம் உள்ளதா?',
        options: yesNoUnsure(5)
      },
      {
        id: 'familyHistory',
        textEn: 'Family history of PCOS or type 2 diabetes?',
        textTa: 'PCOS அல்லது டைப் 2 நீரிழிவு நோயின் குடும்ப வரலாறு உள்ளதா?',
        options: yesNoUnsure(10)
      }
    ]
  },
  menopause: {
    id: 'menopause',
    titleEn: 'Menopause Guide',
    titleTa: 'மாதவிடாய் நிறுத்தம் வழிகாட்டி',
    questions: [
      {
        id: 'age',
        textEn: 'What is your age group?',
        textTa: 'உங்கள் வயது வரம்பு என்ன?',
        options: [
          { value: 'under40', labelEn: 'Under 40', labelTa: '40க்கு கீழ்', score: 2 },
          { value: '40to50', labelEn: '40–50', labelTa: '40–50', score: 8 },
          { value: 'over50', labelEn: 'Above 50', labelTa: '50க்கு மேல்', score: 14 }
        ]
      },
      {
        id: 'lastPeriod',
        textEn: 'How long has it been since your last period?',
        textTa: 'உங்கள் கடைசி மாதவிடாய் முடிந்து எவ்வளவு காலம் ஆகிறது?',
        options: [
          { value: 'regular', labelEn: 'Still regular', labelTa: 'இன்னும் ஒழுங்காக உள்ளது', score: 0 },
          { value: 'few', labelEn: 'A few months', labelTa: 'சில மாதங்கள்', score: 8 },
          { value: 'over1yr', labelEn: 'Over 1 year', labelTa: '1 வருடத்திற்கு மேல்', score: 14 }
        ]
      },
      {
        id: 'hotFlashes',
        textEn: 'Hot flashes or night sweats?',
        textTa: 'சூடான ஆவேசங்கள் அல்லது இரவு வியர்வை உள்ளதா?',
        options: yesNoUnsure(12)
      },
      {
        id: 'moodSleep',
        textEn: 'Mood changes or trouble sleeping?',
        textTa: 'மனநிலை மாற்றங்கள் அல்லது தூக்கத்தில் சிரமம் உள்ளதா?',
        options: yesNoUnsure(8)
      },
      {
        id: 'jointBonePain',
        textEn: 'Joint pain or bone pain?',
        textTa: 'மூட்டு வலி அல்லது எலும்பு வலி உள்ளதா?',
        options: yesNoUnsure(7)
      },
      {
        id: 'memory',
        textEn: 'Noticeable memory lapses or trouble concentrating?',
        textTa: 'குறிப்பிடத்தக்க நினைவக பிரச்சனைகள் அல்லது கவனம் செலுத்துவதில் சிரமம் உள்ளதா?',
        options: yesNoUnsure(5)
      },
      {
        id: 'weight',
        textEn: 'Unexplained weight changes?',
        textTa: 'காரணமின்றி எடை மாற்றங்கள் உள்ளதா?',
        options: yesNoUnsure(4)
      }
    ]
  }
}

export const MODULE_LIST: ModuleId[] = ['breast-cancer', 'pcos', 'menopause']
