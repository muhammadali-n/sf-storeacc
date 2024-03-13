import { client } from '../../app/lib/sanity';
import { customUi, performTransformation } from '../common-transformer';
import customPageTransformerConfig from "./sanity-transform-config.json"
import { transformFooterData, transformHeaderData, transformPdpData, transformPlpData, transformSanityCartData} from './sanity-transformer';

const getDataByQuery = async (query: string) => {

  return await client.fetch(query);
}

export const fetchPageDataBySlug = async (slug: string) => {
  try {
    console.log('fetch data   ');
    // creating page data using slug
    const getPageData = await getDataByQuery(`*[_type == 'nav' && slug.current == "${slug}"]`);
    const homePageData = await getDataByQuery(`*[_type == 'nav' && title == 'Home']`);


    const { transformedData } = performTransformation(getPageData, customPageTransformerConfig)
    console.log("transformedData", transformedData);

    const { transformedHomeData } = performTransformation(homePageData, customPageTransformerConfig)
    console.log("transformedHomeData", transformedHomeData);

    //fixed custom ui
    const result = customUi(transformedData);
    return result
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const fetchAddButton = async () => {
    const AddtoCart = await getDataByQuery("*[_type == 'ProductCard'  && sections._type == 'button']")
    const { transformedData } = performTransformation(AddtoCart, customPageTransformerConfig)
    
    return transformedData
  }
  export const fetchProceedToCheckoutButton = async () => {
    const CheckoutButton = await getDataByQuery("*[_type == 'cartItems' && sections._type == 'button']")
    const { transformedData } = performTransformation(CheckoutButton, customPageTransformerConfig)
    return transformedData
  }  
  export const fetchHomePage = async () => {
    const HomePage = await getDataByQuery(`*[_type == 'nav' && title == 'Home']`);
    const { transformedData } = performTransformation(HomePage, customPageTransformerConfig)
    return transformedData
  } 

export const fetchProductCard = async () => {
  const AddtoCart = await getDataByQuery("*[_type == 'ProductCard'  && sections._type == 'button']")
  const { transformedData } = performTransformation(AddtoCart, customPageTransformerConfig)
  return transformedData
}

export const fetchCartPage = async (language: any) => {
  const en = `*[_type == 'cartItems']{
    itemName,
    sections {
      ButtonColor,
      buttonName,
      translation {
        en
      }
    },
    shipping_fields {
      en
    },
    taxes_fields {
      en
    },
    title {
      en
    },
    total_fields {
      en
    }
  }`;

  const ar = `*[_type == 'cartItems']{
    itemName,
    sections {
      ButtonColor,
      buttonName,
      translation {
        ar
      }
    },
    shipping_fields {
      ar
    },
    taxes_fields {
      ar
    },
    title {
      ar
    },
    total_fields {
      ar
    }
  }`;

  const cartItemsQuery = language === 'ar' ? ar : en;
  const cart = await getDataByQuery(cartItemsQuery)
  const transformedData = transformSanityCartData(cart)
  return transformedData
}

  export const fetchCart = async () => {
    const cart = await getDataByQuery("*[_type == 'cartItems']")
    console.log("cart", cart);
    const transformedData = transformSanityCartData(cart)
    return transformedData
  }

  export const fetchHeader = async () => {

    const header = await getDataByQuery("*[_type == 'header']")
    const transformedData = transformHeaderData(header)
    return transformedData
  }
  
  export const fetchFooter = async () => {
    const footer = await getDataByQuery("*[_type == 'footer']")
    const transformedData= transformFooterData(footer);
    return transformedData
  }

  export const fetchPlpData = async () => {
    const plpData = await getDataByQuery("*[_type == 'plpData']")
    const transformedData= transformPlpData(plpData);
    return transformedData
  }

  export const fetchPdpData = async () => {
    const pdpData = await getDataByQuery("*[_type == 'pdpData']")
    const transformedData= transformPdpData(pdpData);
    return transformedData
  }
