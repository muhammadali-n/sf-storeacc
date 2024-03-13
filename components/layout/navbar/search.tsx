'use client';

import { createUrl } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getContent, performCommonIntegration, performIntegration } from '@/integrations/common-integration';
import { fetchHeader } from '@/integrations/sanity/sanity-integration';
import { urlFor } from '@/app/lib/sanity';
import Image from 'next/image';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  interface MenuItem {
    _key: string;
    path: string;
    translation: {
      ar: string;
      en: string;
    };
  }

  interface HeaderData {
    storeNameTranslation: {
      ar: string;
      en: string;
    };
    storeLogo: string;
    storeLogoTranslation: {
      ar: string;
      en: string;
    };
    searchBar: string;
    searchBarAltTranslation: {
      ar: string;
      en: string;
    };
    menuItems: MenuItem[];
    cartIcon: string;
    cartIconAltTranslation: {
      ar: string;
      en: string;
    };
    placeholder: {
      ar: string;
      en: string;
    }
  }
  const [headerData, setHeaderData] = useState<HeaderData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        // Fetch header data from the API
        const response = await getContent(fetchHeader);
        setHeaderData(response);
      } catch (error) {
        console.error('Error fetching header data:', error);
      }
    };

    fetchHeaderData();
  }, []);

  const handleOnclick = (suggestion: string) => {
    const newParams = new URLSearchParams();
    newParams.set('q', suggestion);
    router.push(createUrl('/product-search/collection', newParams));
    setShowSuggestions(false);
  }

  function onSubmit(e: React.FormEvent<HTMLElement>) {
    e.preventDefault();
    const val = e.target as HTMLFormElement;
    const search = val.search as HTMLInputElement;
    const newParams = new URLSearchParams(searchParams.toString());

    if (search.value) {
      newParams.set('q', search.value);
    } else {
      newParams.delete('q');
    }
    router.push(createUrl('/product-search/collection', newParams));
  }


  const handleInputChange = async (e) => {
    const value = e?.target?.value;
    const search = await performIntegration("getSearchSuggestions", value);
    setSearchQuery(search);
  };

  console.log("search", searchQuery);

  return (
    <div className='search-bar'>
      <form onSubmit={onSubmit} className=" relative w-full lg:w-80 xl:w-full">
        <input
          key={searchParams?.get('q')}
          type="text"
          name="search"
          placeholder={headerData?.searchBarAltTranslation?.ar || headerData?.searchBarAltTranslation?.en || "Search for products..."} autoComplete="off"
          defaultValue={searchParams?.get('q') || ''}
          onChange={handleInputChange}
          style={{ width: '26em' }}
          className="w-full rounded-lg border bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
        />
        <Image
          src={urlFor(headerData?.searchBar)?.url()}
          alt={headerData?.placeholder?.ar || headerData?.placeholder?.en}
          width={30}
          height={30}
          onClick={onSubmit}
          style={{ position: 'absolute' }} // Position search icon
        />
      </form>
      {Array.isArray(searchQuery) && showSuggestions && (
        <ul className="suggestions-list list-unstyled">
          {searchQuery.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleOnclick(suggestion)}
              className="clickable-list-item"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

}
