export const productDetails = `
  query getProductDetailsByProductId($slug: String!) {
    product(slug: $slug) {
      id
      name
      description
      slug
      featuredAsset{
        id
        preview
      }
      assets{
        id
        preview
      }
      variants {
        id
        name
        sku
        stockLevel
        price
        currencyCode
        options{
          name
          code
          id
          groupId
          group{
              id
              code
              name
          }
        }
      }
      optionGroups{
        id
        languageCode
        code
        name
        options{
          id
          code
          name
          groupId
          group{
            id
            code
            name
          }
        }
      }
    }
  }
`;