import { useLanguage } from '../../context/LanguageContext';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
      className="fixed top-4 end-4 z-50 flex items-center gap-1 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 shadow-sm hover:bg-brand-50 transition-colors"
      title="Toggle language"
    >
      🌐 {lang === 'en' ? 'עב' : 'EN'}
    </button>
  );
}
