'use client';

import clsx from 'clsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import styles from '../../styles/product-card.module.css';
import { getContent } from '@/integrations/common-integration';
import { fetchPdpData } from '@/integrations/sanity/sanity-integration';
import { ProductVariant } from '@/lib/types';
import { addItem } from '../cart/handle';
import { useLanguageContext } from '@/app/context/languageContext';
import { useEffect, useState } from 'react';


export function AddToCart({
  variants,
  availableForSale
}: {
  variants: ProductVariant[];
  availableForSale: boolean;
}) {
  const router = useRouter()
  const searchParams = useSearchParams();
  const defaultVariantId = variants?.length === 1 ? variants[0]?.id : undefined;

  const variant = variants?.find((variant: any) =>
    variant?.selectedOptions.every(
      (option: any) => option?.value === searchParams.get(option?.name.toLowerCase())
    )
  );
  const { language } = useLanguageContext()
  const [pdpData, setPdpData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getContent(fetchPdpData);
        setPdpData(data);
      } catch (error) {
        console.error('Error fetching pdpData:', error);
      }
    };
    fetchData();
  }, []);

  const selectedVariantId = variant?.id || defaultVariantId;

  const addToCart = (selectedVariantId) => {
    addItem(selectedVariantId);
    router.push("/cart/cart")

  }

  return (

    <button
      style={{ backgroundColor: pdpData?.buttonColor }}
      className={!availableForSale || !selectedVariantId ? styles['add-to-cart-disabled'] : styles['add-to-cart']}
      onClick={() => addToCart(selectedVariantId)}
      disabled={!availableForSale || !selectedVariantId}
    >
      {/* {item.sections?.translation?.ar || item.sections?.translation?.en} */}
      {availableForSale ? (
        <>
          {language === 'ar' ? pdpData?.buttonName?.ar : pdpData?.buttonName?.en}
        </>
      ) : (
        <>
          {pdpData?.outOfStock?.ar || pdpData?.outOfStock?.en}            </>
      )}
    </button>
  );
}
