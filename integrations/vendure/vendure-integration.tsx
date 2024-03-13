import { getConfig, getConfigForProvider, fetchApiConfig } from "@/config";
import { collectionList } from "@/queries/collection.query";
import { ApolloClient,InMemoryCache } from "@apollo/client";
import { productsList } from "@/queries/products.query";
import { collectionProductsList } from "@/queries/collectionProductsList.query";
import { dataTransformer, transformPdpData } from "./vendure-transformer";
import transformerJsonConfig from './vendure-transform-config.json'
import { productDetails } from "@/queries/productDetails";

const vendureApi = async (provider, methodName:String, ...args) => {
    if (vendureMethods.hasOwnProperty(methodName)) {
      const {commerceConfig} = getConfigForProvider(provider);
      const {apiEndpoint} = commerceConfig;
      console.log(apiEndpoint)
      return await vendureMethods[methodName](apiEndpoint,...args);
    }
}

export const apiFetch = async (endPoint, query) => {
      async function wait(ms) {
          return new Promise(resolve => {
              setTimeout(resolve, ms);
          });
      }
    
      try {
          let retry = 0, result;
      
          do {
              if (retry !== 0) {
                  await wait(Math.pow(2, retry));
  
              }
              result = await fetch(endPoint, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(query),
              });
              retry++;
            //   console.log(retry,"re")
          } while (result.status === 429 || result.status === 400 || result.status=== 401 && (Math.pow(2, retry) <= fetchApiConfig.max_wait));
      
          return result;
      } catch (error) {
          console.error('Error in API fetch:', error);
          throw error;
      }
  };

const getCollectionDetails = async (endPoint : string) => {
    try {
        if (endPoint !== null) {
            const response = await apiFetch(endPoint, { query: collectionList });
            const responseData = await response.json();
            
            const transferData = responseData?.data?.collections?.items;
            const transformedData = dataTransformer(transferData, transformerJsonConfig);
            return transformedData;
        } else {
            return "Configuration != Vendure";
        }
    } catch (error) {
        console.error('Error in getCollectionDetails:', error);
        throw error; 
    }
}


const getProductDetails = async (endPoint: string) => {
    try {
        if (endPoint !== null) {
            const response = await apiFetch(endPoint, { query: productsList });
            const responseData = await response.json();
            return responseData;
        } else {
            return "Configuration != Vendure";
        }
    } catch (error) {
        console.error('Error in getProductDetails:', error);
        throw error; 
    }
};

const getCollectionProductDetails = async (endPoint: string, collectionName: string) => {
    try {
        if (endPoint !== null) {
            const response = await apiFetch(endPoint, {
                query: collectionProductsList,
                variables: { slug: `${collectionName.toLowerCase()}` }
            });
            const responseData = await response.json();
            const transferData = responseData?.data?.collection?.productVariants?.items;
            const transformedResponse = transferData.map(item => ({
                id: item.id,
                title: item.name,
                price: item.price,
                imageSrc: item.product.featuredAsset.preview,
                handle: item.product.slug
              }));
            // const transformedResponse = dataTransformer(transferData, transformerJsonConfig);
            return transformedResponse;
        } else {
            return "Configuration != Vendure";
        }
    } catch (error) {
        console.error('Error in getCollectionProductDetails:', error);
        throw error; 
    }
};

const getProductsByHandle = async (endPoint: string, handle: string, uppercaseLanguage:string) => {
    try {
        if (endPoint !== null) {
            const response = await apiFetch(endPoint, {
                query: productDetails,
                variables: { slug: `${handle.toLowerCase()}` }
            });
            const responseData = await response.json();

            const data = responseData.data.product;
            if (data == null) {
              throw Error;
            }
            const transformedResponse=transformPdpData(data);
            return transformedResponse;
        } else {
            return "Configuration != Vendure";
        }
    } catch (error) {
        console.error('Error in getCollectionProductDetails:', error);
        throw error; 
    }
};


const vendureMethods = {
        "getCollectionDetails":getCollectionDetails,
        "getCollectionProductDetails":getCollectionProductDetails,
        "getProductDetails":getProductDetails,
        "getProductsByHandle": getProductsByHandle,
    }
export default vendureApi