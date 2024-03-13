"use client"
import { getProducts } from '../../../integrations/shopify/shopify-integration';
import ProductGridItems from '@/components/layout/product-grid-items';
import Grid from '@/components/grid';
import { defaultSort , sorting } from '@/lib/constants';
import { getContent, performIntegration } from '@/integrations/common-integration';
import { Collection, Product } from '../../../lib/types';
import { fetchProductCard } from '@/integrations/sanity/sanity-integration';
import styles from '../../../styles/product.module.css';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/grid/productcard';
import Search from '@/components/layout/search';

export default  function SearchPage({searchParams}: {searchParams?:
  { [key: string]: string | string[] | undefined };}) {

 return (
    <>
      <Search searchParams={searchParams}/>
    </>
  );
}
