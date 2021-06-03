import { query as q } from 'faunadb'

import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';

export async function saveSubscription(
    subscriptionId: string,
    custumerId: string,
    createAction = false,
) {
    //Buscar o usuário no banco do fauna com o id customerID

    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    custumerId
                )
            )
        )
    )

    // Obtendo o resto dos dados nescessários da subscription

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
                    
    // Salvar os dados da subscription no fauna

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
    }

    if (createAction) {
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                { data: subscriptionData}
            )
        )
    } else {
        await fauna.query(
            q.Replace(
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscription.id,
                        )
                    )
                ),
                { data: subscriptionData }
            )
        )
    }
}