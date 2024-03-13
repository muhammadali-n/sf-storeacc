import { Product } from '@/lib/types';
import Price from '../price';
import { VariantSelector } from './variant-selector';
import styles from '../../styles/product-card.module.css';
import { AddToCart } from './add-to-cart';


export function ProductDescription({ product }: { product: Product}) {


    return (
        <>
            <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700 bg-black">
                <h1 className="mb-2 text-5xl font-medium">{product?.title}</h1>
                <div className="mb-3">
                {product?
                    <Price
                        amount={product?.highPrice}
                        currencyCode={product?.currencyCode}
                    />
                    :("")}
                </div>
            </div>
            <VariantSelector options={product?.options} variants={product?.variants} />
            {product?.description ? (
                <div className="mb-3">
                    {product?.description}
                </div>
            ) : null}
            {product?
             <AddToCart variants={product?.variants} availableForSale={product?.availableForSale} />
           :("")}
        </>
    );
}
