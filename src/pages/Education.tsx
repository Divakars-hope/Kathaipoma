import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import SpeakButton from '../components/SpeakButton'
import BackButton from '../components/BackButton'
import { MODULE_LIST, MODULES } from '../data/questions'
import type { ModuleId } from '../data/questions'
import { currentAppLanguage, pickLang } from '../utils/localize'

interface Topic {
  simpleEn: string
  simpleTa: string
  simpleHi: string
  medicalEn: string
  medicalTa: string
  medicalHi: string
  mythsEn: { myth: string; truth: string }[]
  mythsTa: { myth: string; truth: string }[]
  mythsHi: { myth: string; truth: string }[]
  whenToVisitEn: string[]
  whenToVisitTa: string[]
  whenToVisitHi: string[]
  emergencyEn: string[]
  emergencyTa: string[]
  emergencyHi: string[]
}

const TOPICS: Record<ModuleId, Topic> = {
  'breast-cancer': {
    simpleEn:
      'Breast cancer happens when cells in the breast grow out of control. Found early, it is very treatable — regular self-checks help you notice changes sooner.',
    simpleTa:
      'மார்பகத்தில் உள்ள செல்கள் கட்டுப்பாடின்றி வளரும்போது மார்பக புற்றுநோய் ஏற்படுகிறது. முன்கூட்டியே கண்டறிந்தால், சிகிச்சை மிகவும் எளிதாக இருக்கும் — வழக்கமான சுய பரிசோதனை மாற்றங்களை விரைவில் கவனிக்க உதவும்.',
    simpleHi:
      'स्तन कैंसर तब होता है जब स्तन की कोशिकाएं अनियंत्रित रूप से बढ़ने लगती हैं। जल्दी पता चलने पर इसका इलाज आसानी से हो सकता है — नियमित स्व-जांच से बदलावों को जल्दी पहचानने में मदद मिलती है।',
    medicalEn:
      'Risk factors include age, family/genetic history, hormonal exposure, and lifestyle. Screening tools include self-exam, clinical breast exam, and mammography as advised by a doctor.',
    medicalTa:
      'வயது, குடும்ப/மரபணு வரலாறு, ஹார்மோன் தாக்கம் மற்றும் வாழ்க்கை முறை ஆகியவை ஆபத்து காரணிகள். மருத்துவரின் ஆலோசனையின்படி சுய பரிசோதனை, மருத்துவமனை பரிசோதனை மற்றும் மேமோகிராம் ஆகியவை பரிசோதனை முறைகள்.',
    medicalHi:
      'जोखिम कारकों में उम्र, पारिवारिक/आनुवंशिक इतिहास, हार्मोनल प्रभाव और जीवनशैली शामिल हैं। जांच के तरीकों में स्व-परीक्षण, क्लिनिकल स्तन जांच और डॉक्टर की सलाह पर मैमोग्राफी शामिल है।',
    mythsEn: [
      { myth: 'Only older women get breast cancer.', truth: 'It can occur at any adult age, though risk rises with age.' },
      { myth: 'A lump always means cancer.', truth: 'Most lumps are not cancer, but any new lump should be checked.' },
      { myth: 'Wearing a bra causes breast cancer.', truth: 'There is no established link between bras and breast cancer.' }
    ],
    mythsTa: [
      { myth: 'வயதான பெண்களுக்கு மட்டுமே மார்பக புற்றுநோய் வரும்.', truth: 'எந்த வயதிலும் ஏற்படலாம், வயது அதிகரிக்கும்போது ஆபத்து அதிகரிக்கும்.' },
      { myth: 'கட்டி இருந்தால் எப்போதும் புற்றுநோய்தான்.', truth: 'பெரும்பாலான கட்டிகள் புற்றுநோய் அல்ல, ஆனாலும் புதிய கட்டியை பரிசோதிக்க வேண்டும்.' },
      { myth: 'பிரா அணிவது மார்பக புற்றுநோயை ஏற்படுத்தும்.', truth: 'பிராவிற்கும் மார்பக புற்றுநோய்க்கும் தொடர்பு நிரூபிக்கப்படவில்லை.' }
    ],
    mythsHi: [
      { myth: 'स्तन कैंसर केवल बड़ी उम्र की महिलाओं को होता है।', truth: 'यह किसी भी वयस्क उम्र में हो सकता है, हालांकि उम्र बढ़ने के साथ जोखिम बढ़ता है।' },
      { myth: 'गांठ का मतलब हमेशा कैंसर होता है।', truth: 'अधिकतर गांठें कैंसर नहीं होतीं, लेकिन किसी भी नई गांठ की जांच करानी चाहिए।' },
      { myth: 'ब्रा पहनने से स्तन कैंसर होता है।', truth: 'ब्रा और स्तन कैंसर के बीच कोई स्थापित संबंध नहीं है।' }
    ],
    whenToVisitEn: ['Any new lump or thickening', 'Nipple discharge or skin changes', 'Persistent unexplained pain'],
    whenToVisitTa: ['புதிய கட்டி அல்லது தடிப்பு', 'மார்பக முனை வெளியேற்றம் அல்லது சரும மாற்றங்கள்', 'நீங்காத காரணமற்ற வலி'],
    whenToVisitHi: ['कोई भी नई गांठ या सख्ती', 'निप्पल से स्राव या त्वचा में बदलाव', 'लगातार बिना कारण का दर्द'],
    emergencyEn: ['Rapidly growing lump', 'Bleeding from the nipple', 'Severe swelling with skin discoloration'],
    emergencyTa: ['விரைவாக வளரும் கட்டி', 'மார்பக முனையில் இரத்தப்போக்கு', 'சரும நிற மாற்றத்துடன் கடுமையான வீக்கம்'],
    emergencyHi: ['तेज़ी से बढ़ती गांठ', 'निप्पल से रक्तस्राव', 'त्वचा के रंग में बदलाव के साथ गंभीर सूजन']
  },
  pcos: {
    simpleEn:
      'PCOS (Polycystic Ovary Syndrome) is a common hormonal condition that can affect periods, weight, skin, and fertility. It is manageable with lifestyle changes and medical care.',
    simpleTa:
      'PCOS (பாலிசிஸ்டிக் ஓவரி சிண்ட்ரோம்) என்பது மாதவிடாய், எடை, சருமம் மற்றும் கருவுறுதலை பாதிக்கக்கூடிய பொதுவான ஹார்மோன் நிலை. வாழ்க்கை முறை மாற்றங்கள் மற்றும் மருத்துவ கவனிப்புடன் கட்டுப்படுத்த முடியும்.',
    simpleHi:
      'PCOS (पॉलीसिस्टिक ओवरी सिंड्रोम) एक सामान्य हार्मोनल स्थिति है जो मासिक धर्म, वजन, त्वचा और प्रजनन क्षमता को प्रभावित कर सकती है। सही जीवनशैली और चिकित्सीय देखभाल से इसे नियंत्रित किया जा सकता है।',
    medicalEn:
      'PCOS involves hormonal imbalance and often insulin resistance. Diagnosis typically considers cycle history, symptoms, and sometimes ultrasound or blood tests — always via a doctor.',
    medicalTa:
      'PCOS-ல் ஹார்மோன் சமநிலையின்மை மற்றும் பெரும்பாலும் இன்சுலின் எதிர்ப்பு இருக்கும். மாதவிடாய் வரலாறு, அறிகுறிகள், மற்றும் சில நேரங்களில் அல்ட்ராசவுண்ட் அல்லது இரத்த பரிசோதனை மூலம் மருத்துவர் கண்டறிவார்.',
    medicalHi:
      'PCOS में हार्मोनल असंतुलन और अक्सर इंसुलिन प्रतिरोध शामिल होता है। निदान आमतौर पर मासिक चक्र के इतिहास, लक्षणों और कभी-कभी अल्ट्रासाउंड या रक्त जांच पर आधारित होता है — हमेशा डॉक्टर द्वारा।',
    mythsEn: [
      { myth: 'PCOS means you cannot have children.', truth: 'Many women with PCOS conceive, sometimes with medical support.' },
      { myth: 'Only overweight women get PCOS.', truth: 'PCOS affects women of all body types.' }
    ],
    mythsTa: [
      { myth: 'PCOS இருந்தால் குழந்தை பெற முடியாது.', truth: 'PCOS உள்ள பல பெண்கள் மருத்துவ உதவியுடன் கருத்தரிக்கிறார்கள்.' },
      { myth: 'எடை அதிகமுள்ள பெண்களுக்கு மட்டுமே PCOS வரும்.', truth: 'PCOS எல்லா உடல் வகை பெண்களையும் பாதிக்கலாம்.' }
    ],
    mythsHi: [
      { myth: 'PCOS होने का मतलब है कि आप मां नहीं बन सकतीं।', truth: 'PCOS वाली कई महिलाएं, कभी-कभी चिकित्सीय सहायता से, गर्भधारण करती हैं।' },
      { myth: 'PCOS केवल अधिक वजन वाली महिलाओं को होता है।', truth: 'PCOS हर शरीर के प्रकार की महिलाओं को प्रभावित कर सकता है।' }
    ],
    whenToVisitEn: ['Periods missed for 3+ months', 'Sudden excess hair growth or acne', 'Difficulty conceiving after 6–12 months trying'],
    whenToVisitTa: ['3+ மாதங்கள் மாதவிடாய் இல்லாதது', 'திடீர் அதிக முடி வளர்ச்சி அல்லது முகப்பரு', '6–12 மாதங்கள் முயற்சித்தும் கருத்தரிக்காதது'],
    whenToVisitHi: ['3+ महीने मासिक धर्म न आना', 'अचानक अधिक बालों की वृद्धि या मुंहासे', '6–12 महीने प्रयास के बाद भी गर्भधारण में कठिनाई'],
    emergencyEn: ['Severe pelvic pain', 'Very heavy bleeding'],
    emergencyTa: ['கடுமையான இடுப்பு வலி', 'மிக அதிக இரத்தப்போக்கு'],
    emergencyHi: ['गंभीर पेल्विक दर्द', 'बहुत अधिक रक्तस्राव']
  },
  menopause: {
    simpleEn:
      'Menopause is a natural stage when periods stop permanently, usually between 45–55. Symptoms like hot flashes and mood changes are common and manageable.',
    simpleTa:
      'மாதவிடாய் நிறுத்தம் என்பது பொதுவாக 45–55 வயதிற்குள் மாதவிடாய் நிரந்தரமாக நிற்கும் இயற்கையான கட்டம். சூடான ஆவேசங்கள் மற்றும் மனநிலை மாற்றங்கள் பொதுவானவை, கட்டுப்படுத்தக்கூடியவை.',
    simpleHi:
      'रजोनिवृत्ति एक प्राकृतिक अवस्था है जब मासिक धर्म स्थायी रूप से बंद हो जाता है, आमतौर पर 45–55 वर्ष की आयु के बीच। गर्म झोंके और मूड में बदलाव जैसे लक्षण सामान्य हैं और इन्हें नियंत्रित किया जा सकता है।',
    medicalEn:
      'Perimenopause (transition years) and menopause involve declining estrogen, affecting bone density, heart health, and mood. Doctors can advise on symptom relief and screening.',
    medicalTa:
      'மாதவிடாய் நிறுத்த மாற்றக் காலம் மற்றும் மாதவிடாய் நிறுத்தம் ஈஸ்ட்ரோஜன் குறைவதால் எலும்பு அடர்த்தி, இதய ஆரோக்கியம், மனநிலையை பாதிக்கும். அறிகுறி நிவாரணம் குறித்து மருத்துவர் ஆலோசனை அளிக்க முடியும்.',
    medicalHi:
      'पेरिमेनोपॉज़ (संक्रमण के वर्ष) और रजोनिवृत्ति में एस्ट्रोजन में कमी होती है, जो हड्डियों के घनत्व, हृदय स्वास्थ्य और मूड को प्रभावित करती है। डॉक्टर लक्षणों से राहत और जांच के बारे में सलाह दे सकते हैं।',
    mythsEn: [
      { myth: 'Menopause means the end of a healthy life.', truth: 'Many women live full, active, healthy lives after menopause.' },
      { myth: 'It happens suddenly overnight.', truth: 'It is usually a gradual transition over months or years.' }
    ],
    mythsTa: [
      { myth: 'மாதவிடாய் நிறுத்தம் என்றால் ஆரோக்கியமான வாழ்க்கை முடிந்தது.', truth: 'பல பெண்கள் மாதவிடாய் நிறுத்தத்திற்குப் பிறகும் முழுமையான, ஆரோக்கியமான வாழ்க்கை வாழ்கிறார்கள்.' },
      { myth: 'இது திடீரென்று ஒரே இரவில் நடக்கும்.', truth: 'இது பொதுவாக மாதங்கள் அல்லது ஆண்டுகளாக படிப்படியான மாற்றமாகும்.' }
    ],
    mythsHi: [
      { myth: 'रजोनिवृत्ति का मतलब है स्वस्थ जीवन का अंत।', truth: 'कई महिलाएं रजोनिवृत्ति के बाद भी पूर्ण, सक्रिय और स्वस्थ जीवन जीती हैं।' },
      { myth: 'यह अचानक एक ही रात में हो जाता है।', truth: 'यह आमतौर पर महीनों या वर्षों में धीरे-धीरे होने वाला बदलाव है।' }
    ],
    whenToVisitEn: ['Bleeding after periods have stopped for a year', 'Severe mood or sleep disruption', 'Bone or joint pain affecting daily life'],
    whenToVisitTa: ['ஒரு வருடம் மாதவிடாய் நின்ற பிறகு இரத்தப்போக்கு', 'கடுமையான மனநிலை அல்லது தூக்க பிரச்சனை', 'தினசரி வாழ்க்கையை பாதிக்கும் எலும்பு/மூட்டு வலி'],
    whenToVisitHi: ['मासिक धर्म एक साल से बंद होने के बाद रक्तस्राव', 'गंभीर मूड या नींद में परेशानी', 'हड्डी या जोड़ों का दर्द जो रोज़मर्रा की ज़िंदगी को प्रभावित करे'],
    emergencyEn: ['Heavy bleeding after menopause', 'Chest pain or shortness of breath'],
    emergencyTa: ['மாதவிடாய் நிறுத்தத்திற்குப் பிறகு அதிக இரத்தப்போக்கு', 'மார்பு வலி அல்லது மூச்சுத் திணறல்'],
    emergencyHi: ['रजोनिवृत्ति के बाद भारी रक्तस्राव', 'सीने में दर्द या सांस लेने में तकलीफ']
  }
}

export default function Education() {
  const { t, i18n } = useTranslation()
  const lang = currentAppLanguage(i18n.language)
  const [active, setActive] = useState<ModuleId>('breast-cancer')
  const topic = TOPICS[active]

  const simpleHeading = pickLang(lang, 'In simple words', 'எளிய விளக்கம்', 'सरल शब्दों में')
  const medicalHeading = pickLang(lang, 'Medical explanation', 'மருத்துவ விளக்கம்', 'चिकित्सीय व्याख्या')

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <BackButton className="mb-6" />

      <h1 className="font-display font-bold text-2xl text-ink-900 mb-8 text-center">
        {t('education.title')}
      </h1>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {MODULE_LIST.map((id) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`px-4 py-2 rounded-full text-sm font-display font-semibold transition-colors ${
              active === id
                ? 'bg-blossom-400 text-white'
                : 'bg-white/70 text-ink-700 border border-blossom-200 hover:border-blossom-300'
            }`}
          >
            {pickLang(lang, MODULES[id].titleEn, MODULES[id].titleTa, MODULES[id].titleHi)}
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-ink-900 mb-2">{simpleHeading}</h2>
          <p className="text-sm font-friendly text-ink-700 leading-relaxed">
            {pickLang(lang, topic.simpleEn, topic.simpleTa, topic.simpleHi)}
          </p>
          <SpeakButton
            className="mt-4"
            textEn={topic.simpleEn}
            textTa={topic.simpleTa}
            textHi={topic.simpleHi}
          />
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-ink-900 mb-2">{medicalHeading}</h2>
          <p className="text-sm font-body text-ink-700/90 leading-relaxed">
            {pickLang(lang, topic.medicalEn, topic.medicalTa, topic.medicalHi)}
          </p>
          <SpeakButton
            className="mt-4"
            textEn={topic.medicalEn}
            textTa={topic.medicalTa}
            textHi={topic.medicalHi}
          />
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-ink-900 mb-4">{t('education.myths')}</h2>
          <div className="space-y-4">
            {(lang === 'ta' ? topic.mythsTa : lang === 'hi' ? topic.mythsHi : topic.mythsEn).map((m, i) => (
              <div key={i} className="text-sm font-friendly">
                <p className="text-red-500 font-semibold">✗ {m.myth}</p>
                <p className="text-green-600 mt-1">✓ {m.truth}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-ink-900 mb-3">{t('education.whenToVisit')}</h2>
          <ul className="space-y-2 text-sm font-friendly text-ink-700">
            {(lang === 'ta' ? topic.whenToVisitTa : lang === 'hi' ? topic.whenToVisitHi : topic.whenToVisitEn).map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-blossom-400">•</span> {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl2 border-2 border-red-200 bg-red-50 p-6">
          <h2 className="font-display font-semibold text-red-600 mb-3">
            {t('education.emergencySymptoms')}
          </h2>
          <ul className="space-y-2 text-sm font-friendly text-red-700">
            {(lang === 'ta' ? topic.emergencyTa : lang === 'hi' ? topic.emergencyHi : topic.emergencyEn).map((line) => (
              <li key={line} className="flex gap-2">
                <span>•</span> {line}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
