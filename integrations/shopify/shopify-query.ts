
export const getProductsByCollectionQuery = `
  query GetProductsByCollection($collectionId: ID!) {
    collection(id: $collectionId) {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              maxVariantPrice {
                amount
              }
            }
            images(first: 1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;



export const getCollectionProductsQuery = /* GraphQL */ `
  query getCollectionProducts(
    $handle: String!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $handle) {
      products(sortKey: $sortKey, reverse: $reverse, first: 100) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              maxVariantPrice {
                amount
              }
            }
            variants(first: 25){
              edges{
                node{
                  id
                }
              }
            }
            images(first: 1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getProductByHandle = (language: string): string => {
  return `
    query productDetails($handle: String!) @inContext(language: ${language}) {
      productByHandle(handle: $handle) {
      id
      handle
      availableForSale
      title
      description
      descriptionHtml
      options {
        id
        name
        values
      }
      priceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 250) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
      featuredImage {
        ...image
      }
      images(first: 20) {
        edges {
          node {
            ...image
          }
        }
      }
      seo {
        ...seo
      }
      tags
      updatedAt
    }
  }

  fragment image on Image {
    originalSrc
    altText
  }

fragment seo on SEO {
  title
  description
}
`;
}

export const getProductRecommendations=`
query getProductRecommendations($productId: ID!) {
  productRecommendations(productId: $productId)
   {
    id
    handle
    availableForSale
    title
    description
    descriptionHtml
    options {
      id
      name
      values
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 250) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
    featuredImage {
      ...image
    }
    images(first: 20) {
      edges {
        node {
          ...image
        }
      }
    }
    seo {
      ...seo
    }
    tags
    updatedAt
  }
}

fragment image on Image {
  originalSrc
  altText
}

fragment seo on SEO {
  title
  description
}
`;

export const productDetails= `
{
    products(first: 20) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            maxVariantPrice {
              amount
            }
          }
          images(first: 1) {
            edges {
              node {
                originalSrc
                altText
              }
            }
          }
        }
      }
    }
  }
`;
export const collectionDetails= 
  `
  {
    collections(first: 10, sortKey: TITLE, reverse: false) {
      edges {
        node {
          id
          title
          products(first: 5) {
            edges {
              node {
                id
                title
                descriptionHtml
                variants(first: 1) {
                  edges {
                    node {
                      priceV2 {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      originalSrc
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  `;

  export const productByIdsQuery = (productIds: string[]): string => {
    return `
      query {
        nodes(ids: [${productIds.map(id => `"${id}"`).join(',')}]) {
          ... on Product {
            id
            title
            handle
            description
            priceRange {
              maxVariantPrice {
                amount
              }
            }
            images(first: 1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
          }
        }
      }
    `;
  };

  // productQueries.ts

export const getProductByIdQuery = (productId: string): string => {
  return `
    {
      product(id: "${productId}") {
        id
        title
        handle
        description
        priceRange {
          maxVariantPrice {
            amount
          }
        }
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
      }
    }
  `;
};


/*************************************
******* shopify cart start ***********
**************************************/


export const imageFragment = /* GraphQL */ `
  fragment image on Image {
    url
    altText
    width
    height
  }
`;

export const seoFragment = /* GraphQL */ `
fragment seo on SEO {
  description
  title
}
`;

export const productFragment = /* GraphQL */ `
  fragment product on Product {
    id
    handle
    availableForSale
    title
    description
    descriptionHtml
    options {
      id
      name
      values
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 250) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
    featuredImage {
      ...image
    }
    images(first: 20) {
      edges {
        node {
          ...image
        }
      }
    }
    seo {
      ...seo
    }
    tags
    updatedAt
  }
  ${imageFragment}
  ${seoFragment}
`;


const cartFragment = /* GraphQL */ `
  fragment cart on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions {
                name
                value
              }
              product {
                ...product
              }
            }
          }
        }
      }
    }
    totalQuantity
  }
  ${productFragment}
`;

export const createCartMutation = /* GraphQL */ `
  mutation createCart($lineItems: [CartLineInput!]) {
    cartCreate(input: { lines: $lineItems }) {
      cart {
        ...cart
      }
    }
  }
  ${cartFragment}
`;

export const addToCartMutation = /* GraphQL */ `
  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
    }
  }
  ${cartFragment}
`;

export const getCartMutation = `
query($cartId: ID!) {
  cart(id: $cartId) {
    id
    createdAt
    updatedAt
    lines(first: 10) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions {
                name
                value
              }
              product {
                ...product
              }
            }
          }
          attributes {
            key
            value
          }
        }
      }
    }
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
      totalDutyAmount {
        amount
        currencyCode
      }
    }
    buyerIdentity {
      email
      phone
      customer {
        id
      }
      countryCode
      deliveryAddressPreferences {
        ... on MailingAddress {
          address1
          address2
          city
          provinceCode
          countryCodeV2
          zip
        }
      }
    }
  }
}
${productFragment}
`;


export const removeFromCartMutation = /* GraphQL */ `
  mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...cart
      }
    }
  }
  ${cartFragment}
`;

export const editCartItemsMutation = /* GraphQL */ `
  mutation editCartItems($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
    }
  }
  ${cartFragment}
`;

export const collectionFragment = /* GraphQL */ `
  fragment collection on Collection {
    handle
    title
    description
    seo {
      ...seo
    }
    updatedAt
  }
  ${seoFragment}
`;

export const getCollectionsQuery = /* GraphQL */ `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      ...collection
    }
  }
  ${collectionFragment}
`;

/*************************************
******* shopify cart end ***********
**************************************/


export const getProductsQuery = /* GraphQL */ `
  query getProducts($sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(sortKey: $sortKey, reverse: $reverse, query: $query, first: 100) {
      edges {
        node {
          ...product
        }
      }
    }
  }
  ${productFragment}
`;
export const searchSuggestion =`
query suggestions($query: String!) {
  predictiveSearch(query: $query) {
    queries {
      text
    }
    collections {
      id
    }
    products {
      id
      title
    }
    pages {
      id
    }
    articles {
      id
    }
  }
}`;
