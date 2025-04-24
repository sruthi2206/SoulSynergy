import { createContext, ReactNode, useContext, useState, useEffect } from "react";

// Define translations for UI elements in different languages
const TRANSLATIONS: Record<string, Record<string, string>> = {
  english: {
    // Navigation
    home: "Home",
    journal: "Journal",
    coaches: "Coaches",
    rituals: "Healing Rituals",
    courses: "Courses",
    community: "Community",
    membership: "Membership",
    profile: "Profile",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    logout: "Logout",
    login: "Login",
    register: "Register",
    
    // Common
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    search: "Search",
    submit: "Submit",
    
    // Journal page
    title: "Daily Alignment Journal",
    subtitle: "Record your thoughts, emotions, and goals with AI-powered insights to guide your healing journey",
    newEntry: "New Journal Entry",
    newEntryDescription: "Express your thoughts, emotions, and aspirations in this structured journal",
    general: "General",
    gratitude: "Gratitude",
    affirmation: "Affirmation",
    shortTerm: "Short-Term",
    longTerm: "Long-Term",
    insightsTitle: "Journal Insights",
    insightsDescription: "AI-generated insights from your journal entries",
    generalTitle: "💭 General Reflections",
    generalDescription: "Write freely about your thoughts, emotions, and experiences",
    generalPlaceholder: "How are you feeling today? What's on your mind?",
    gratitudeTitle: "✨ I am grateful for...",
    gratitudeDescription: "List things that brought you joy, peace, or inspiration today",
    gratitudePlaceholder: "Gratitude",
    affirmationTitle: "🌟 Today's Affirmation",
    affirmationDescription: "Write a positive I AM statement to align your energy",
    affirmationPlaceholder: "I am...",
    shortTermTitle: "🎯 Steps I will take today",
    shortTermDescription: "What key actions will move you forward today?",
    shortTermPlaceholder: "Step",
    longTermTitle: "🚀 Steps toward my long-term goals",
    longTermDescription: "What aligned actions or habits will move you toward your vision?",
    longTermPlaceholder: "My long-term vision includes...",
    saveButton: "Save Entry",
    addAnother: "Add Another",
    emotionPatterns: "Emotion Patterns",
    chakraBalance: "Chakra Balance",
    goalProgress: "Goal Progress",
    personalizedWisdom: "Personalized Wisdom",
    noEntries: "No journal entries yet",
    startWriting: "Start writing to see your insights here",
    voiceJournal: "Voice Journal",
    stopRecording: "Stop Recording"
  },
  hindi: {
    // Navigation
    home: "होम",
    journal: "जर्नल",
    coaches: "कोच",
    rituals: "हीलिंग अनुष्ठान",
    courses: "पाठ्यक्रम",
    community: "समुदाय",
    membership: "सदस्यता",
    profile: "प्रोफाइल",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    logout: "लॉग आउट",
    login: "लॉग इन",
    register: "रजिस्टर",
    
    // Common
    loading: "लोड हो रहा है...",
    save: "सहेजें",
    cancel: "रद्द करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    view: "देखें",
    search: "खोजें",
    submit: "जमा करें",
    
    // Journal page
    title: "दैनिक संरेखण जर्नल",
    subtitle: "अपने उपचार यात्रा को मार्गदर्शन करने के लिए AI-संचालित अंतर्दृष्टि के साथ अपने विचारों, भावनाओं और लक्ष्यों को रिकॉर्ड करें",
    newEntry: "नई जर्नल एंट्री",
    newEntryDescription: "इस संरचित जर्नल में अपने विचारों, भावनाओं और आकांक्षाओं को व्यक्त करें",
    general: "सामान्य",
    gratitude: "कृतज्ञता",
    affirmation: "दृढ़ीकरण",
    shortTerm: "अल्पकालिक",
    longTerm: "दीर्घकालिक",
    insightsTitle: "जर्नल अंतर्दृष्टि",
    insightsDescription: "आपकी जर्नल प्रविष्टियों से AI-निर्मित अंतर्दृष्टि",
    generalTitle: "💭 सामान्य चिंतन",
    generalDescription: "अपने विचारों, भावनाओं और अनुभवों के बारे में स्वतंत्र रूप से लिखें",
    generalPlaceholder: "आज आप कैसा महसूस कर रहे हैं? आपके मन में क्या है?",
    gratitudeTitle: "✨ मैं इसके लिए आभारी हूँ...",
    gratitudeDescription: "उन चीजों की सूची बनाएं जिन्होंने आपको आज खुशी, शांति या प्रेरणा दी",
    gratitudePlaceholder: "कृतज्ञता",
    affirmationTitle: "🌟 आज का दृढ़ीकरण",
    affirmationDescription: "अपनी ऊर्जा को संरेखित करने के लिए एक सकारात्मक मैं हूँ कथन लिखें",
    affirmationPlaceholder: "मैं हूँ...",
    shortTermTitle: "🎯 आज मैं जो कदम उठाऊंगा",
    shortTermDescription: "कौन से प्रमुख कार्य आपको आज आगे बढ़ाएंगे?",
    shortTermPlaceholder: "कदम",
    longTermTitle: "🚀 मेरे दीर्घकालिक लक्ष्यों की ओर कदम",
    longTermDescription: "कौन से संरेखित कार्य या आदतें आपको अपनी दृष्टि की ओर ले जाएंगी?",
    longTermPlaceholder: "मेरी दीर्घकालिक दृष्टि में शामिल है...",
    saveButton: "प्रविष्टि सहेजें",
    addAnother: "एक और जोड़ें",
    emotionPatterns: "भावना पैटर्न",
    chakraBalance: "चक्र संतुलन",
    goalProgress: "लक्ष्य प्रगति",
    personalizedWisdom: "व्यक्तिगत ज्ञान",
    noEntries: "अभी तक कोई जर्नल प्रविष्टियाँ नहीं हैं",
    startWriting: "अपनी अंतर्दृष्टि यहां देखने के लिए लिखना शुरू करें",
    voiceJournal: "आवाज जर्नल",
    stopRecording: "रिकॉर्डिंग बंद करें"
  },
  tamil: {
    // Navigation
    home: "முகப்பு",
    journal: "பதிவேடு",
    coaches: "பயிற்சியாளர்கள்",
    rituals: "குணமாக்கல் சடங்குகள்",
    courses: "பாடநெறிகள்",
    community: "சமூகம்",
    membership: "உறுப்பினர்",
    profile: "சுயவிவரம்",
    darkMode: "இருள் பயன்முறை",
    lightMode: "ஒளி பயன்முறை",
    logout: "வெளியேறு",
    login: "உள்நுழைய",
    register: "பதிவு செய்ய",
    
    // Common
    loading: "ஏற்றுகிறது...",
    save: "சேமி",
    cancel: "ரத்து செய்",
    edit: "திருத்து",
    delete: "அழி",
    view: "பார்வை",
    search: "தேடு",
    submit: "சமர்ப்பி",
    
    // Journal page
    title: "தினசரி சீரமைப்பு பதிவேடு",
    subtitle: "உங்கள் குணமாக்கல் பயணத்தை வழிநடத்த AI-உருவாக்கிய நுண்ணறிவுகளுடன் உங்கள் எண்ணங்கள், உணர்வுகள் மற்றும் இலக்குகளைப் பதிவு செய்யுங்கள்",
    newEntry: "புதிய பதிவேடு உள்ளீடு",
    newEntryDescription: "இந்த கட்டமைக்கப்பட்ட பதிவேட்டில் உங்கள் எண்ணங்கள், உணர்வுகள் மற்றும் விருப்பங்களை வெளிப்படுத்துங்கள்",
    general: "பொது",
    gratitude: "நன்றி",
    affirmation: "உறுதிமொழி",
    shortTerm: "குறுகிய கால",
    longTerm: "நீண்ட கால",
    insightsTitle: "பதிவேடு நுண்ணறிவுகள்",
    insightsDescription: "உங்கள் பதிவுகளில் இருந்து AI உருவாக்கிய நுண்ணறிவுகள்",
    generalTitle: "💭 பொது சிந்தனைகள்",
    generalDescription: "உங்கள் எண்ணங்கள், உணர்வுகள் மற்றும் அனுபவங்களை சுதந்திரமாக எழுதுங்கள்",
    generalPlaceholder: "இன்று நீங்கள் எப்படி உணர்கிறீர்கள்? உங்கள் மனதில் என்ன உள்ளது?",
    gratitudeTitle: "✨ நான் இதற்கு நன்றியுள்ளவன்...",
    gratitudeDescription: "இன்று உங்களுக்கு மகிழ்ச்சி, அமைதி அல்லது ஊக்கத்தை அளித்த விஷயங்களை பட்டியலிடுங்கள்",
    gratitudePlaceholder: "நன்றி",
    affirmationTitle: "🌟 இன்றைய உறுதிமொழி",
    affirmationDescription: "உங்கள் சக்தியை சீரமைக்க ஒரு நேர்மறையான நான் இருக்கிறேன் அறிக்கையை எழுதுங்கள்",
    affirmationPlaceholder: "நான் இருக்கிறேன்...",
    shortTermTitle: "🎯 இன்று நான் எடுக்கும் நடவடிக்கைகள்",
    shortTermDescription: "எந்த முக்கிய செயல்கள் உங்களை இன்று முன்னேற்றும்?",
    shortTermPlaceholder: "படி",
    longTermTitle: "🚀 என் நீண்ட கால இலக்குகளை நோக்கிய படிகள்",
    longTermDescription: "எந்த சீரமைக்கப்பட்ட செயல்கள் அல்லது பழக்கங்கள் உங்களை உங்கள் தொலைநோக்கை நோக்கி நகர்த்தும்?",
    longTermPlaceholder: "என் நீண்ட கால தொலைநோக்கில் உள்ளவை...",
    saveButton: "பதிவை சேமி",
    addAnother: "மற்றொன்றை சேர்",
    emotionPatterns: "உணர்வு முறைகள்",
    chakraBalance: "சக்கர சமநிலை",
    goalProgress: "இலக்கு முன்னேற்றம்",
    personalizedWisdom: "தனிப்பயனாக்கப்பட்ட அறிவு",
    noEntries: "இதுவரை பதிவேடு உள்ளீடுகள் இல்லை",
    startWriting: "உங்கள் நுண்ணறிவுகளை இங்கே பார்க்க எழுத தொடங்குங்கள்",
    voiceJournal: "குரல் பதிவேடு",
    stopRecording: "பதிவை நிறுத்து"
  }
};

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState("english");

  // Load the language preference from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem("soulsync-language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("soulsync-language", language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.english[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// List of supported languages
const LANGUAGES = [
  { name: "English", code: "english" },
  { name: "Hindi", code: "hindi" },
  { name: "Tamil", code: "tamil" },
  { name: "Telugu", code: "telugu" },
  { name: "Malayalam", code: "malayalam" },
  { name: "Kannada", code: "kannada" },
  { name: "Urdu", code: "urdu" }
];

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return { ...context, LANGUAGES };
}