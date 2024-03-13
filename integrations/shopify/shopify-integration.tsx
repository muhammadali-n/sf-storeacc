
import { HIDDEN_PRODUCT_TAG, TAGS } from '@/lib/constants';
import { getConfig, getConfigForProvider ,fetchApiConfig} from '../../config';
import { dataTransformer, performTransformation, TransformationResult } from '../common-transformer';
import { addToCartMutation, collectionDetails, createCartMutation, editCartItemsMutation, getCartMutation, getCollectionProductsQuery, getCollectionsQuery, getProductByHandle, getProductByIdQuery, getProductRecommendations, getProductsByCollectionQuery, getProductsQuery, productByIdsQuery, productDetails, removeFromCartMutation,searchSuggestion} from './shopify-query';
import transformerConfig from './shopify-transform-config.json';

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: number;
  tags: string[];
  images: Connection<Image>;
  variants: Connection<ProductVariant>;
}
interface ShopifyCollection {
  handle: string;
  id: string;
  title: string;
}

export type Collection = ShopifyCollection & {
  path: string;
};

export type ShopifyCollectionOperation = {
  data: {
    collection: ShopifyCollection;
  };
  variables: {
    handle: string;
  };
};

interface ShopifyProductId {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: number;
  imageSrc:any;
}


interface ShopifyProductsResponse {
  data: {
    nodes: any;
    products: {
      edges: {
        node: {
          images: any;
          id: string;
          title: string;
          handle: string;
          description: string;
          priceRange: {
            maxVariantPrice: {
              amount: number;
            };
          };
        };
      }[];
    };
  };
}

interface ShopifyCollectionsResponse {
  data: {
    collections: {
      edges: {
        node: {

          id: string;
          title: string;

        };
      }[];
    };
  };
}

export type ShopifyCollectionProductsOperation = {
  data: {
    collection: {
      products: Connection<ShopifyProduct>;
    };
  };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

interface ShopifyProducts {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: number;
  imageSrc?: string;
  variants?: any;
}

interface ShopifyProductResponse {
  data: {
    collection: {
      products: {
        edges: {
          node: {
            variants: any;
            id: string;
            title: string;
            handle: string;
            description: string;
            priceRange: {
              maxVariantPrice: {
                amount: number;
              };
            };
            images: {
              edges: {
                node: {
                  originalSrc: string;
                  altText: string;
                };
              }[];
            };
          };
        }[];
      };
    };
  };
}

interface ShopifyProductIdResponse {
  data: {
      product: any;
      edges: {
        node: {
          images: any;
          id: string;
          title: string;
          handle: string;
          description: string;
          priceRange: {
            maxVariantPrice: {
              amount: number;
            };
          };
        };
      }[];
    };
  };

 
  export const apiFetch = async (endPoint: string, storefrontAccessToken: string, options: any): Promise<Response> => {  
    async function wait(ms: number) {
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
            'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
            ...(options.headers || {})
          },
          body: JSON.stringify({
            ...(options.query && { query: options.query }),
            ...(options.variables && { variables: options.variables })
          }),
          cache: options.cache,
          ...(options.tags && { next: { tags: options.tags } })
        });
        retry++;
      } while (result.status === 429 || result.status === 400 || result.status=== 401 && (Math.pow(2, retry) <= fetchApiConfig.max_wait));
  
      return result;
    } catch (error) {
      console.error('Error in API fetch:', error);
      throw error;
    }
  };
  
const getProductDetails = async (endPoint,storefrontAccessToken): Promise<any> => {
  const query = {
    query: productDetails,
  };

  try {
    const response = await apiFetch(endPoint, storefrontAccessToken, query); // Await apiFetch here

    if (!response.ok) {
      throw new Error(`Failed to fetch Shopify products. Status: ${response.status}`);
    }

    const responseData: ShopifyProductsResponse = await response.json();
    const data: ShopifyProduct[] = responseData.data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      price: node.priceRange.maxVariantPrice.amount,
      imageSrc: node.images.edges[0]?.node.originalSrc,
    }));
    const { transformedData } = performTransformation(data, transformerConfig);
    return transformedData;
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
};

const getCollectionDetails = async (endPoint,storefrontAccessToken): Promise<any> => {

  const query = {
    query: collectionDetails,
  };

  try {
    const response = await apiFetch(endPoint, storefrontAccessToken, query); // Await apiFetch here

    if (!response.ok) {
      throw new Error(`Failed to fetch Shopify products. Status: ${response.status}`);
    }

    const responseData: ShopifyCollectionsResponse = await response.json();
    const data= responseData.data.collections.edges
    .map(({ node }) => ({
      id: node.id,
      title: node.title,
    }));

    // const data: ShopifyCollection[] = responseData.data.collections.edges
    // .filter(({ node }) => node.products.edges.length > 0) // Filter collections with products
    // .map(({ node }) => ({
    //   id: node.id,
    //   title: node.title,
    // }));

    const { transformedData } = performTransformation(data, transformerConfig);

    return transformedData;
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
};

export const getCollectionProductDetails = async (endPoint, storefrontAccessToken, selectedCollection: string, sortKey: string, reverse: Boolean): Promise<ShopifyProduct[]> => {
  const query = {
    query: getCollectionProductsQuery,
    variables: {
      handle: selectedCollection, sortKey: sortKey,
      reverse: reverse
    }
  };
  try {
    const response = await apiFetch(endPoint, storefrontAccessToken, query); // Await apiFetch here

    if (!response.ok) {
      throw new Error(`Failed to fetch products by collection. Status: ${response.status}`);
    }
    const responseData: ShopifyProductResponse = await response.json();

    const products: ShopifyProducts[] = responseData.data.collection.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      price: node.priceRange.maxVariantPrice.amount,
      imageSrc: node.images.edges[0]?.node.originalSrc,
      variantId: node.variants.edges.map(({ node }: { node: any }) => node.id)
    }));
    return products;
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    throw error;
  }
};

export const getProductsByHandle = async (endPoint, storefrontAccessToken,handle: string, language: string): Promise<any> => {
  const { commerceConfig } = getConfig();


  const query = {
    query: getProductByHandle(language),
    variables: {
      handle: handle,
      language:language
    }
  };

  try {
    const response = await apiFetch(endPoint, storefrontAccessToken, query); // Await apiFetch here

    if (!response.ok) {
      throw new Error(`Failed to fetch product by handle. Status: ${response.status}`);
    }
    const responseData = await response.json();     
    const data = responseData.data.productByHandle;

    if (data == null) {
      throw Error;
    }
      const transformProductData = (data) => {
      return {
        id: data?.id,
        handle: data?.handle,
        availableForSale: data?.availableForSale,
        title: data?.title,
        description: data?.description,
        descriptionHtml:data?.descriptionHtml,
        price: data?.priceRange?.maxVariantPrice?.amount,
        options: data?.options?.map(option => ({
          id: option?.id,
          name: option?.name,
          values: option?.values
        })),
        featuredImage: {
          src: data?.featuredImage?.originalSrc,
          altText: data?.featuredImage?.altText || ''
        },
        images: data?.images?.edges?.map(edge => ({
          src: edge?.node?.originalSrc,
          altText: edge?.node?.altText || ''
        })),
        variants: data?.variants?.edges?.map(edge => ({
          id: edge?.node?.id,
          title: edge?.node?.title,
          availableForSale: edge?.node?.availableForSale,
          selectedOptions: edge?.node?.selectedOptions,
          price: edge?.node?.price?.amount,
          currencyCode: edge?.node?.price?.currencyCode,

        })),
        currencyCode: data?.priceRange?.minVariantPrice?.currencyCode,
        highPrice: data?.priceRange?.maxVariantPrice?.amount,
        lowPrice: data?.priceRange?.minVariantPrice?.amount,
      };
    };
    const transformedData = transformProductData(data);
    return transformedData;

  } catch (e) {
    console.error('Error fetching product by handle:', Error);
    throw Error;
  }
};


export const getRelatedProductsById = async (productId: string): Promise<any[]> => {
  const { commerceConfig } = getConfig();
  const storefrontAccessToken = commerceConfig.storefrontAccessToken;
  const apiEndpoint = commerceConfig.apiEndpoint;

  const query = {
    query: getProductRecommendations,
    variables: {
      productId: productId,
    }
  };

  try {
    const response = await apiFetch(apiEndpoint, storefrontAccessToken, query); // Await apiFetch here

    if (!response.ok) {
      throw new Error(`Failed to fetch related products. Status: ${response.status}`);
    }
    const responseData = await response.json();
    const products = responseData?.data?.productRecommendations.map(({ id, title, handle, description, priceRange, featuredImage, currencyCode }) => ({
      id,
      title,
      handle,
      description,
      price: priceRange?.maxVariantPrice?.amount,
      imageSrc: featuredImage?.originalSrc,
      currencyCode
    }));

    return products;
  } catch (error) {
    console.error('Error fetching related products:', error);
    throw error;
  }
};

// export const getProductById = async (productId: string): Promise<TransformationResult> => {
//   const { commerceConfig } = getConfig();
//   const storefrontAccessToken = commerceConfig.storefrontAccessToken;
//   const apiEndpoint = commerceConfig.apiEndpoint;

//   const query = `
//     {
//       product(id: "${productId}") {
//         id
//         title
//         handle
//         description
//         priceRange {
//           maxVariantPrice {
//             amount
//           }
//         }
//         images(first: 1) {
//           edges {
//             node {
//               originalSrc
//               altText
//             }
//           }
//         }
//       }
//     }
//   `;

//   try {
//     const response = await fetch(apiEndpoint, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
//       },
//       body: JSON.stringify({ query }),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch Shopify product. Status: ${response.status}`);
//     }

//     const responseData: ShopifyProductIdResponse = await response.json();
//     const data: ShopifyProductId[] = responseData.data.edges.map(({ node }) => ({
//       id: node.id,
//       title: node.title,
//       handle: node.handle,
//       description: node.description,
//       price: node.priceRange.maxVariantPrice.amount,
//       imageSrc: node.images.edges[0]?.node.originalSrc,
//     }));
//     const { transformedData } = performTransformation(data , transformerConfig);
//     return transformedData;
//   } catch (error) {
//     console.error('Error fetching Shopify product:', error);
//     throw error;
//   }
// };
export const getProductByIds = async (productIds: string[]): Promise<ShopifyProductId[]> => {
  const { commerceConfig } = getConfig();
  const storefrontAccessToken = commerceConfig.storefrontAccessToken;
  const apiEndpoint = commerceConfig.apiEndpoint;
  const query = {
    query: productByIdsQuery(productIds),
  
  };

  try {
    const response = await apiFetch(apiEndpoint, storefrontAccessToken, query); // Await apiFetch here

    if (!response.ok) {
      throw new Error(`Failed to fetch Shopify products. Status: ${response.status}`);
    }

    const responseData: ShopifyProductsResponse = await response.json();
    console.log('Shopify API response:', responseData);

    const products: ShopifyProductId[] = responseData.data.nodes.map((node: any) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      price: node.priceRange.maxVariantPrice.amount,
      imageSrc: node.images.edges[0]?.node.originalSrc,
    }));

    console.log('Transformed products:', products);
    return products;
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
};

export const getProductById = async (productId: string): Promise<ShopifyProductId[]> => {
  const { commerceConfig } = getConfig();
  const storefrontAccessToken = commerceConfig.storefrontAccessToken;
  const apiEndpoint = commerceConfig.apiEndpoint;

  const query = {
    query: getProductByIdQuery(productId),
   
  };

  try {
   
    const response = await apiFetch(apiEndpoint, storefrontAccessToken, query); // Await apiFetch here


    if (!response.ok) {
      throw new Error(`Failed to fetch product from shopify. Status: ${response.status}`);
    }

    const responseData: ShopifyProductsResponse = await response.json();
    console.log('Shopify API response:', responseData);

    return responseData?.data?.product;
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
};



/*************************************
******* shopify cart start ***********
**************************************/

export type ShopifyRemoveFromCartOperation = {
  data: {
    cartLinesRemove: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lineIds: string[];
  };
};

export type Edge<T> = {
  node: T;
};
export type CartItem = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: number;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: any;
  };
};
export type Connection<T> = {
  edges: Array<Edge<T>>;
};


export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: any;
    totalAmount: any;
    totalTaxAmount: any;
  };
  lines: Connection<CartItem>;
  totalQuantity: any;
};

export type ShopifyUpdateCartOperation = {
  data: {
    cartLinesUpdate: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      id: string;
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

const removeEdgesAndNodes = (array: Connection<any>) => {
  return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: '0.0',
      currencyCode: 'USD'
    };
  }
  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines)
  };
};

type ExtractVariables<T> = T extends { variables: object } ? T['variables'] : never;

export async function shopifyFetch<T>({
  cache = 'force-cache',
  headers,
  query,
  tags,
  variables
}: {
  cache?: RequestCache;
  headers?: HeadersInit;
  query: string;
  tags?: string[];
  variables?: ExtractVariables<T>;
}): Promise<{
  ok: any; status: number; body: T
} | never> {
  const { commerceConfig } = getConfig();

  const storefrontAccessToken = commerceConfig.storefrontAccessToken;
  const apiEndpoint = commerceConfig.apiEndpoint;

  try {
    const result = await apiFetch(apiEndpoint, storefrontAccessToken, { query, variables, cache, headers, tags });
    
    if (!result.ok) {
      throw new Error(`Failed to fetch Shopify cart. Status: ${result.status}`);
    }
    const body = await result.json();
    console.log("body", body);

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body
    };
  } catch (e) {
    throw {
      error: e,
      query
    };
  }
}
export type ShopifyCreateCartOperation = {
  data: { cartCreate: { cart: ShopifyCart } };
};
export type Cart = Omit<ShopifyCart, 'lines'> & {
  lines: CartItem[];
};

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
    cache: 'no-store'
  });
  console.log("resresres", res);
  return reshapeCart(res.body.data.cartCreate.cart);
}

// -----------shopify add to cart

export type ShopifyAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  try {
    console.log("Adding to cart...", lines);
    const res = await shopifyFetch<ShopifyAddToCartOperation>({
      query: addToCartMutation,
      variables: {
        cartId,
        lines,
      },
      cache: 'no-store',
    });
    if (res.status!=200) {
      throw new Error(`Failed to add items to the cart. Status: ${res.status}`);
    }
    const data = reshapeCart(res.body.data.cartLinesAdd.cart);
    return data
  } catch (error) {
    console.error("Error:", error.message);
    throw error; // Rethrow the error to handle it at a higher level if needed
  }
}

// ******* shopify remove Cart *********

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds
    },
    cache: 'no-store'
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

// ************ shopify get cart **********  

export const getCart = async (cartId: string) => {
  try {
    const { commerceConfig } = getConfig();

    const storefrontAccessToken = commerceConfig.storefrontAccessToken;
    const apiEndpoint = commerceConfig.apiEndpoint;

    const query = {
      query: getCartMutation,
      variables: {
        cartId: cartId,
      }
    };

    const response = await apiFetch(apiEndpoint, storefrontAccessToken, query); // Await apiFetch here

    if (!response.ok) {
      throw new Error(`Failed to fetch Shopify cart. Status: ${response.status}`);
    }

    const data = await response.json();

    const products = removeEdgesAndNodes(data.data.cart.lines)
    const cost = data.data.cart.cost


    console.log(" data from getcart", data);

    return { products, cost };
  } catch (error) {
    throw error;
  }
};

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines
    },
    cache: 'no-store'
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

/*************************************
******* shopify cart end ***********
**************************************/

export type ShopifyProductsOperation = {
  data: {
    products: Connection<ShopifyProduct>;
  };
  variables: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

export type Product = Omit<ShopifyProduct, 'variants' | 'images'> & {
  variants: ProductVariant[];
  images: Image[];
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
}; 

export type Money = {
  amount: string;
  currencyCode: string;
}; 

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

const reshapeProduct = (product: ShopifyProduct, filterHiddenProducts: boolean = true) => {
  if (!product || (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants)
  };
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`
    };
  });
};
export async function getSearchSuggestions(endPoint,storefrontAccessToken ,searchQuery: string): Promise<string[]> {
  
  if (searchQuery.length > 0) {
    const query1 =
    {
      query: searchSuggestion,
      variables: {
        query: searchQuery,
      }
    };
    if (!searchQuery) {
      console.log('Search query is not provided');
      return;
    }
    const response = await apiFetch(endPoint, storefrontAccessToken, query1);
    const data = await response.json();
    console.log("data", data);
    
    if (data.data && data.data.predictiveSearch && data.data.predictiveSearch.products) {
      const productTitles = data.data.predictiveSearch.products.map(({ title }) => title);
      return productTitles;
    }
    else {
      throw new Error("Unexpected response");
    }
  }
}







export const shopifyApi = async (provider, methodName, ...args) => {
  if(shopifyMethods.hasOwnProperty(methodName)){
    const {commerceConfig} = getConfigForProvider(provider);
    const {apiEndpoint , storefrontAccessToken} = commerceConfig
    return await shopifyMethods[methodName](apiEndpoint,storefrontAccessToken,...args);
  }
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
    query: getCollectionProductsQuery,
    tags: [TAGS.collections, TAGS.products],
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === 'CREATED_AT' ? 'CREATED' : sortKey
    }
  });
  console.log("aaaa",res)

  if (!res.body.data.collection) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  return reshapeProducts(removeEdgesAndNodes(res.body.data.collection.products));
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionsQuery,
    tags: [TAGS.collections],
    variables: {
      handle
    }
  });
  console.log("",res)


  return reshapeCollection(res.body.data.collection);
}
const reshapeCollection = (collection: ShopifyCollection): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`
  };
};

export const getProducts = async (endPoint, storefrontAccessToken, query1: string, sortKey: string, reverse: Boolean): Promise<ShopifyProduct[]> => {
  console.log("query",query1)
  const querys = {
    query: getProductsQuery,
    variables: {
      sortKey:sortKey,
      reverse :reverse,
       query :query1
      
    }
  };

  try {
    const response = await apiFetch(endPoint, storefrontAccessToken, querys); // Await apiFetch here

    if (!response.ok) {
      throw new Error(`Failed to fetch products by collection. Status: ${response.status}`);
    }
    const responseData= await response.json();
    const blue = reshapeProducts(removeEdgesAndNodes(responseData.data.products));
    return blue
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    throw error;
  }
};


const shopifyMethods = {
  "getCollectionDetails":getCollectionDetails,
  "getProductDetails":getProductDetails,
  "getCollectionProductDetails": getCollectionProductDetails,
  "getProductsByHandle": getProductsByHandle,
  "getRelatedProductsById": getRelatedProductsById,
  "createCart":createCart,
  "addToCart":addToCart,
  "removeFromCart":removeFromCart,
  "getcart":getCart,
  "updateCart":updateCart,
  "getSearchSuggestions": getSearchSuggestions,
  "getProducts":getProducts
}