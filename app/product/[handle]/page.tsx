'use client'
import { Suspense, useEffect, useState } from 'react';

import Footer from '@/components/layout/footer';
import { Image, Product } from '@/lib/types';
import Link from 'next/link';
import { getProductsByHandle, getRelatedProductsById } from '@/integrations/shopify/shopify-integration';
import { performCommonIntegration, getContent, performIntegration } from '@/integrations/common-integration';
import { Gallery } from '@/components/product/gallery';
import { ProductDescription } from '@/components/product/product-description';
import './style.css';
import { Col, Row } from 'reactstrap';
import { fetchPdpData } from '@/integrations/sanity/sanity-integration';
import { useLanguageContext } from '@/app/context/languageContext';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const runtime = 'edge';

export default function ProductPage({ params }: { params: { handle: string } }) {
  const [product, setProducts] = useState<Product | null>(null);
  const {language} = useLanguageContext()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uppercaseLanguage = language.toUpperCase();

        const product = await performIntegration("getProductsByHandle", params.handle, uppercaseLanguage);
        setProducts(product);
      } catch (error) {
        if (error?.message?.includes('Status: 401')) {
          toast.error('Unauthorized access.');
        } if (error?.message?.includes(`Status:500`)) {
          toast.error('Internal server Error.');
        }
        else {
          toast.error('Error in fetching data');
        }
      }
    };
    fetchData();
  }, [language, params.handle]);

  return (
    <>
      <div className={"page-container"}>
        <div className="center-container">
          <div>
            <Gallery
              images={product?.images && Array.isArray(product?.images)
                ? product?.images.map((image: any) => ({
                  src: image?.src,
                  altText: image?.altText
                }))
                : []}
            />
          </div>
        </div>
        <div className="w-full lg:w-1/2 filters">
          <div className="rounded-lg p-8 dark:bg-black dark:border dark:border-neutral-800">
            <ProductDescription product={product} />

          </div>
        </div>
        <RelatedProducts id={product?.id} />
      </div>
      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}

const RelatedProducts = ({ id }: { id: string }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [pdpData, setPdpdata]=useState<any>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const relatedProducts= await performCommonIntegration(getRelatedProductsById, id);
        setRelatedProducts(relatedProducts);
        const pdpData = await getContent(fetchPdpData)
        setPdpdata(pdpData);
      } catch (error) {
        console.error('Error fetching collections:', error);

      }
    };
    fetchData();
  }, [id]);

  if (!relatedProducts?.length) return null;

  return (
    <>
      <div className='d-flex ml-3'>
        <Row>      
          <h2 className="mb-4  text-2xl font-bold">{pdpData?.relatedProducts?.ar || pdpData?.relatedProducts?.en}</h2>
          {relatedProducts.map((product:Product) => (

            <Col key={product.id} className='mb-3' style={{ width: "auto", maxWidth: "300px" }}>
              <Link className="relative inline-block h-full w-full" href={`/product/${product.handle}`}style={{ textDecoration: 'none', color: 'inherit' }}>

                <div className="card">
                  <div className='card-img'>

                    <img className="card-img-top" src={product?.imageSrc} alt="Card image cap" />
                  </div>
                  <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="card-title">
                      <h5><strong>{product.title}</strong></h5>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <button className="btn btn-primary price-button">{product.price} {product.currencyCode}</button>
                    </div>
                  </div>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </div>

    </>
  );
}
