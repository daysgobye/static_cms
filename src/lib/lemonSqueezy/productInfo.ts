type BaseProductInfo = {
    features: string[];
    subTitle: string;
}
interface ProductInfoWithLemonSqueezy extends BaseProductInfo {
    lemonSqueezyVariantId: string
}
interface ProductInfoWithOutLemonSqueezy extends BaseProductInfo {
    title: string;
    price: string | number
    description: string
}
type ProductInfo = ProductInfoWithOutLemonSqueezy | ProductInfoWithLemonSqueezy

export type PopulatedProduct = ProductInfoWithOutLemonSqueezy

//FIXME: replace with your plan info

const freePlan: ProductInfo = {
    features: [
        "1 user",
        "10k records",
        "Community support"
    ],
    title: "Free",
    subTitle: "Free forever",
    price: "Free",
    description: "Great for side projects or when your just starting out."
}
const StarterPlan: ProductInfo = {
    features: [
        "Everything from free plan",
        "3 user",
        "100k records",
        "Email support"
    ],
    subTitle: "Get off to the right start.",
    //FIXME: replace with your lemonSqueezy Variant Id
    lemonSqueezyVariantId: "366191"
}
const ProPlan: ProductInfo = {
    features: [
        "Everything from starter plan",
        "5 user",
        "1m records",
        "Live chat support"
    ],
    subTitle: "Get off to the right start.",
    //FIXME: replace with your lemonSqueezy Variant Id
    lemonSqueezyVariantId: "366194"
}


//FIXME: Add any additional plans to this array
export const plans = [freePlan, StarterPlan, ProPlan]
