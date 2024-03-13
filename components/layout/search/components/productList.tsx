"use client"
import { getProducts } from '../../../integrations/shopify/shopify-integration';
import ProductGridItems from '@/components/layout/product-grid-items';
import Grid from '@/components/grid';
import { defaultSort, sorting } from '@/lib/constants';
import { getContent, performIntegration } from '@/integrations/common-integration';
import { Collection, Product } from '../../../lib/types';
import { fetchProductCard } from '@/integrations/sanity/sanity-integration';
import styles from '../../../../styles/product.module.css';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/grid/productcard';

export default function ProductList(props:any) {
    

    return (
        <>
            {props.searchValue ? (
                <p className="mb-4">
                    {props.products?.length === 0
                        ? 'There are no products that match '
                        : `Showing ${props.products?.length} ${props.resultsText} for `}
                    <span className="font-bold">&quot;{props.searchValue}&quot;</span>
                </p>
            ) : null}
            {<div className={styles['center-container']}>
                <div className={styles['grid-container']}>
                    {props.products?.map((product) => (
                        <ProductCard key={product.id} product={product} className={styles['grid-item']} button={props.button} />
                    ))}
                </div>

            </div>}
        </>
    );
}
