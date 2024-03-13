// YourComponent.js
import { useLanguageContext } from '@/app/context/languageContext';
import React from 'react';

const YourComponent = () => {
  const { language, changeLanguage } = useLanguageContext();

  return (
    <div className="mb-3">
      <select
        className="language-switcher"
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="ar">Arabic</option>
      </select>
    </div>
  );
};

export default YourComponent;
