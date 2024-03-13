import React, { useContext, useState } from 'react';
import styles from '../../styles/product-card.module.css';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Context } from '@/app/context';
import { addItem } from '../cart/handle';
import { performCommonIntegration } from '@/integrations/common-integration';
import { useLanguageContext } from '@/app/context/languageContext';
import { toast } from 'react-toastify';

interface Product {
  featuredImage: any;
  handle:string;
  variantId: any;
  id: string;
  title: string;
  price: string;
  imageSrc: string;
}


// ProductCard.tsx


const ProductCard: React.FC<{ product: Product,className:any, button: any }> = ({ product, button }) => {
  const [cart, setCart] = useState([]);
  const contextValue = useContext(Context)
  const router = useRouter();
  const { handleAddToCart } = contextValue as { cartItems: any[]; handleAddToCart: (getCurrectItem: any) => void };

  const addToCart = (selectedVariantId:any) => {
   performCommonIntegration(addItem,selectedVariantId) 
   
  }
  const { language } = useLanguageContext();


  return (
    <div className={styles['product-card-container']}>
      <Link className="relative inline-block h-full w-full " href={`/product/${product.handle}`} style={{ textDecoration: 'none', color: 'inherit' }}>     

      <div className={styles['flex-container']}>
        <div>
          <img src={product.imageSrc || product?.featuredImage?.url} alt={product.title} className={styles['product-image']} />
        </div>
        <div className={styles['product-title']}>
          {product.title}
        </div>

        <div className={styles['product-price']}>
          ${product.price}
        </div>
        <div className={styles['product-price']}>
          {Array.isArray(button) && button.map((item: any, index: any) => (
            <button key={index}
              style={{ backgroundColor: item?.sections?.ButtonColor?.hex }} className={styles['add-to-cart']}
              onClick={() => addToCart(product.variantId[0])}
            >
              { language==='ar'? item.sections?.translation?.ar : item.sections?.translation?.en}
            </button>
          ))}
        </div>
      </div>
      </Link>
    </div>
  );
};

export default ProductCard;


