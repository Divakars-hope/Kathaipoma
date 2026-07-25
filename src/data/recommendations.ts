import type { ModuleId } from './questions'
import type { RiskLevel } from './riskEngine'

export interface ModuleRecommendation {
  dietEn: string[]
  dietTa: string[]
  exerciseEn: string[]
  exerciseTa: string[]
  tipsEn: string[]
  tipsTa: string[]
}

export const RECOMMENDATIONS: Record<ModuleId, ModuleRecommendation> = {
  'breast-cancer': {
    dietEn: ['More vegetables, fruits, and whole grains', 'Limit processed and red meat', 'Limit alcohol'],
    dietTa: ['அதிக காய்கறிகள், பழங்கள், முழு தானியங்கள்', 'பதப்படுத்தப்பட்ட மற்றும் சிவப்பு இறைச்சியை குறைக்கவும்', 'மதுவை கட்டுப்படுத்தவும்'],
    exerciseEn: ['At least 150 minutes of moderate activity per week', 'Brisk walking, yoga, or swimming'],
    exerciseTa: ['வாரத்திற்கு குறைந்தது 150 நிமிடங்கள் மிதமான உடற்பயிற்சி', 'வேகமாக நடத்தல், யோகா அல்லது நீச்சல்'],
    tipsEn: [
      'Do a monthly self-examination a few days after your period ends',
      'Know your family history and share it with your doctor',
      'Go for a clinical breast exam if you are above 40'
    ],
    tipsTa: [
      'மாதவிடாய் முடிந்த சில நாட்களுக்குப் பிறகு மாதம் ஒரு முறை சுய பரிசோதனை செய்யுங்கள்',
      'உங்கள் குடும்ப வரலாற்றை அறிந்து மருத்துவரிடம் பகிரவும்',
      '40 வயதிற்கு மேல் இருந்தால் மருத்துவமனையில் மார்பக பரிசோதனை செய்யுங்கள்'
    ]
  },
  pcos: {
    dietEn: ['Low glycemic-index foods', 'More fiber, less refined sugar', 'Regular meal timings'],
    dietTa: ['குறைந்த கிளைசெமிக் குறியீட்டு உணவுகள்', 'அதிக நார்ச்சத்து, குறைந்த சுத்திகரிக்கப்பட்ட சர்க்கரை', 'ஒழுங்கான உணவு நேரம்'],
    exerciseEn: ['30 minutes of activity most days', 'Strength training twice a week helps insulin sensitivity'],
    exerciseTa: ['பெரும்பாலான நாட்களில் 30 நிமிட உடற்பயிற்சி', 'வாரத்திற்கு இரண்டு முறை பலப்படுத்தும் பயிற்சி இன்சுலின் உணர்திறனுக்கு உதவும்'],
    tipsEn: [
      'Track your cycle length even without an app — a notebook works fine',
      'PCOS is manageable with the right lifestyle and medical guidance',
      'Ask your doctor about hormone and insulin resistance tests'
    ],
    tipsTa: [
      'ஆப் இல்லாமலும் உங்கள் மாதவிடாய் சுழற்சியை குறிப்பேட்டில் கண்காணிக்கவும்',
      'சரியான வாழ்க்கை முறை மற்றும் மருத்துவ வழிகாட்டுதலுடன் PCOS-ஐ கட்டுப்படுத்த முடியும்',
      'ஹார்மோன் மற்றும் இன்சுலின் எதிர்ப்பு பரிசோதனைகள் பற்றி மருத்துவரிடம் கேளுங்கள்'
    ]
  },
  menopause: {
    dietEn: ['Calcium and Vitamin D rich foods for bone health', 'More plant-based protein', 'Limit caffeine near bedtime'],
    dietTa: ['எலும்பு ஆரோக்கியத்திற்கு கால்சியம் மற்றும் வைட்டமின் D நிறைந்த உணவுகள்', 'அதிக தாவர அடிப்படையிலான புரதம்', 'படுக்கை நேரத்தில் காஃபினை குறைக்கவும்'],
    exerciseEn: ['Weight-bearing exercise for bone strength', 'Gentle stretching or yoga for joint pain'],
    exerciseTa: ['எலும்பு வலிமைக்கு எடை தாங்கும் பயிற்சி', 'மூட்டு வலிக்கு மென்மையான நீட்சி அல்லது யோகா'],
    tipsEn: [
      'Hot flashes and mood changes are common and manageable',
      'Regular bone density checks are recommended after menopause',
      'Talk to your doctor about symptom relief options'
    ],
    tipsTa: [
      'சூடான ஆவேசங்கள் மற்றும் மனநிலை மாற்றங்கள் பொதுவானவை, கட்டுப்படுத்தக்கூடியவை',
      'மாதவிடாய் நின்ற பிறகு தொடர்ந்து எலும்பு அடர்த்தி பரிசோதனை பரிந்துரைக்கப்படுகிறது',
      'அறிகுறி நிவாரண வழிகள் குறித்து மருத்துவரிடம் பேசுங்கள்'
    ]
  }
}

export function riskLevelSuggestsDoctorVisit(level: RiskLevel): boolean {
  return level !== 'low'
}
