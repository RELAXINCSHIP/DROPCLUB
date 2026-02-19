import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<import('@stripe/stripe-js').Stripe | null>;

const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51T2LnvRzX9jiFfU6KQVSNt1ikDGh2sxVRqPnAU0isulcYA32QxOCIuytb7L8BfgJn1uEKMono0oxbkVMjUVoxWIZ00wltxW5gv');
    }
    return stripePromise;
};

export default getStripe;
