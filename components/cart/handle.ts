import { addToCart, createCart, getCart, removeFromCart } from "@/integrations/shopify/shopify-integration";
import { TAGS } from "@/lib/constants";
import { revalidateTag } from "next/cache";
import { getCookie, setCookie } from "@/utils/cookieUtils";
import { ToastContainer, toast } from 'react-toastify';

export async function addItem(selectedVariantId: string | undefined) {
  try {
    let cartId = getCookie('cartId');
    let cart;

    console.log("cartId", cartId);

    if (!cartId) {
      cart = await createCart();
      cartId = cart.id;
      setCookie('cartId', cartId, 30 * 24 * 60 * 60); 
    } else {
      cart = await getCart(cartId);
    }

    if (!cartId || !cart) {
      return 'Error creating or retrieving cart';
    }

    if (!selectedVariantId) {
      return 'Missing product variant ID';
    }
    await addToCart(cartId, [{ merchandiseId: selectedVariantId, quantity: 1 }]);
    // revalidateTag(TAGS.cart);

    return 'Item added to cart successfully';

  } catch (error) {
    console.log(error,"error")
    if (error?.message?.includes('Status: 401')) {
      toast.error('Unauthorized access.');
    } if (error?.message?.includes(`Status:500`)) {
      toast.error('Internal server Error.');
    }
    else {
      toast.error('Error in Adding data to cart');
    }
  }
}

export async function removeItem( lineId: string) {
  let cartId = getCookie('cartId');

  if (!cartId) {
    return 'Missing cart ID';
  }

  try {
    await removeFromCart(cartId, [lineId]);
    // revalidateTag(TAGS.cart);
  } catch (error) {
    if (error?.message?.includes('Status: 401')) {
      toast.error('Unauthorized access.');
    } if (error?.message?.includes(`Status:500`)) {
      toast.error('Internal server Error.');
    }
    else {
      toast.error('Error in removing data from cart');
    }
  }
}
