import { getProduct, lemonSqueezySetup, createCheckout as lemonSqueezyCreateCheckout, type NewCheckout, type Checkout } from "@lemonsqueezy/lemonsqueezy.js";
import { plans, type PopulatedProduct } from "./productInfo";

const apiKey = import.meta.env.LEMON_SQUEEZY_API_KEY;
const storeId = import.meta.env.LEMON_SQUEEZY_STORE_ID;
lemonSqueezySetup({
    apiKey,
    onError: (error) => console.error("Error!", error),
});

export const getProducts = async (): Promise<PopulatedProduct[]> => {
    return await Promise.all(plans.map(async (plan) => {
        if ("lemonSqueezyVariantId" in plan) {
            const { error, data } = await getProduct(plan.lemonSqueezyVariantId, { include: ['store'] });
            if (data) {
                return {
                    ...plan,
                    title: data.data.attributes.name,
                    price: data.data.attributes.price_formatted,
                    description: data.data.attributes.description
                }
            } else {
                throw error
            }

        } else {
            return { ...plan }
        }
    }))

}

export const createCheckout = async (variantId: string) => {
    const newCheckout: NewCheckout = {
        productOptions: {
            name: 'New Checkout Test',
            description: 'a new checkout test',
        },
        checkoutOptions: {
            embed: true,
            media: true,
            logo: true,
        },
        checkoutData: {
            email: 'tita0x00@gmail.com',
            name: 'Lemon Squeezy Test',
        },
        expiresAt: null,
        preview: true,
        testMode: true,
    };
    const { statusCode, error, data } = await lemonSqueezyCreateCheckout(storeId, variantId, newCheckout);
}