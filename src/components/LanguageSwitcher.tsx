import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
      title={i18n.language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
    >
      <Globe className="w-4 h-4 text-primary-600" />
      <span>{i18n.language === 'en' ? 'EN' : 'VI'}</span>
    </button>
  )
}
