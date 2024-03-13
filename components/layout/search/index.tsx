"use client"
import React, { useState, useEffect } from 'react'
import { getProducts } from '../../../integrations/shopify/shopify-integration';
import { defaultSort, sorting } from '@/lib/constants';
import ProductList from './components/productList';
import { Collection, Product } from '../../../lib/types';
import { getContent, performIntegration } from '@/integrations/common-integration';
import { fetchProductCard, fetchPlpData } from '@/integrations/sanity/sanity-integration';
import styles from '../../../styles/product.module.css';




export default function Search({ searchParams }: {
    searchParams?:
    { [key: string]: string | string[] | undefined };
}) {

    const { sort, q: searchValue } = searchParams as { [key: string]: string };
    const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;
    const [button, setButton] = useState("");
    const [products, setProducts] = useState([])
    const resultsText = products?.length > 1 ? 'results' : 'result';
    const [product, setProduct] = useState<Product[] | null>(null);
    const [collections, setCollections] = useState<Collection[] | null>(null);
    const [selectedCollection, setSelectedCollection] = useState<string>('');
    const [sortKeys, setSortKey] = useState<string>('RELEVANCE');
    const [reverses, setReverse] = useState<boolean>(false);
    const [sortOption, setSortOption] = useState({ title: 'Relevance', slug: null, sortKey: 'RELEVANCE', reverse: false });
    const [title, setTitle] = useState<string>('Relevance');
    const [plpData, setPlpData] = useState([]);



    useEffect(() => {
        async function fetchProducts() {
            try {
                const data = await getContent(fetchPlpData);
                setPlpData(data);
                const transCollectionData = await performIntegration("getCollectionDetails");
                setCollections(transCollectionData);
                console.log("yyy",transCollectionData)
                const firstCollectionTitle = transCollectionData?.[0]?.title
                setSelectedCollection(firstCollectionTitle);
                const transformedData = await performIntegration("getCollectionProductDetails", firstCollectionTitle, sortKey, reverse);
                console.log("zzz",transformedData);
                setProducts(transformedData);
                const button = await getContent(fetchProductCard)
                setButton(button)
                const response = await performIntegration("getProducts",searchValue ,sortKey, reverse);
                setProducts(response);
            } catch (errors) {
                console.log(errors);
            }
        }
        fetchProducts()
    }, [searchValue])

    if (collections === null && products === null) {
        return <p>Loading in Progress...</p>;
    }

    const handleCategoryClick = async (collectionTitle: string) => {
        try {
            setProducts([])
            const transformedData = await performIntegration("getCollectionProductDetails", collectionTitle, sortKey, reverse);
            setProducts(transformedData);
            setSelectedCollection(collectionTitle);
        } catch (errors) {
            setProducts(null);
            setSelectedCollection(collectionTitle);
            console.error('Error fetching products for collection:', errors);
        }
    };

    const handleSortChange = async (selectedSort: string, reverse: Boolean, title: string) => {
        try {
            const transformedData = await performIntegration("getCollectionProductDetails", selectedCollection, selectedSort, reverse);
            setProducts(transformedData);
            setSortKey(selectedSort);
            setTitle(title);
        }
        catch (errors) {
            setProducts(null);
            setSortKey(selectedSort);
            setTitle(title);
            console.error('Error fetching products for collection:', errors);
        }

    };

    return (
        <>
            <div className={styles['page-container']}>

                {collections === null ? (
                    <p>Loading collections...</p>
                ) : (
                    <div className={styles['collection-list']}>
                        <h2>{plpData?.collections?.ar || plpData?.collections?.en}</h2>
                        <ul className={styles['list']}>
                            {collections.map((collection) => (
                                <li key={collection.id} onClick={() => handleCategoryClick(collection.title)} style={{ listStyleType: 'none' }} className={collection.title === selectedCollection ? styles['selected-option'] : ''}>
                                    {collection.title}
                                </li>
                            ))}
                        </ul>
                    </div>

                )}
                {products === null || products.length == 0 ? (
                    <>
                        <div className={styles['center-container']}>
                            <div className={styles['grid-container']}>
                                <p className="{styles['no-products-message']">No products found.</p>
                            </div>

                        </div>
                        <div className={styles['filters']}>
                            <>
                                <label>{plpData?.sortby?.ar || plpData?.sortby?.en}</label>
                                <ul className={styles['sort-options']}>
                                    {sorting.map((option) => (
                                        <li key={option.title} onClick={() => handleSortChange(option.sortKey, option.reverse, option.title)} style={{ listStyleType: 'none' }} className={option.title === title ? styles['selected-option'] : ''}>{option.title}</li>
                                    ))}
                                </ul>
                            </>
                        </div>
                    </>
                ) : (
                    <>

                        <div className={styles['center-container']}>
                            <div className={styles['grid-container']}>
                                {products && Array.isArray(products) && products.length > 0 && (
                                    <ProductList searchValue={searchValue} products={products} resultsText={resultsText} button={button} />

                                )}
                            </div>

                        </div>
                        <div className={styles['filters']}>
                            <>
                                <label>{plpData?.sortby?.ar || plpData?.sortby?.en}</label>
                                <ul className={styles['sort-options']}>
                                    {sorting.map((option) => (
                                        <li key={option.title} onClick={() => handleSortChange(option.sortKey, option.reverse, option.title)} style={{ listStyleType: 'none' }} className={option.title === title ? styles['selected-option'] : ''}>{option.title}</li>
                                    ))}
                                </ul>
                            </>
                        </div>
                    </>

                )}




            </div>
        </>
    )
}
