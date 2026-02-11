const Razorpay = require('razorpay');
const crypto = require('crypto');

const { CREDIT_TO_PAISA_MAPPING, PLAN_IDS } = require('../constants/paymentConstants');
const Users = require('../model/users');

const razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentsController = {

    // Create Order
    createOrder: async (request, response) => {
        try {
            const { credits } = request.body;

            if (!CREDIT_TO_PAISA_MAPPING[credits]) {
                return response.status(400).json({
                    message: "Purchase Credits To Continue!!"
                });
            }

            const amountInPaise = CREDIT_TO_PAISA_MAPPING[credits];

            const order = await razorpayClient.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            });

            return response.status(200).json({ order });

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Verify Order
    verifyOrder: async (request, response) => {
        try {
            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                credits
            } = request.body;

            const body = razorpay_order_id + '|' + razorpay_payment_id;

            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return response.status(400).json({ message: "Invalid Transaction!!" });
            }

            const user = await Users.findById(request.user._id);
            if (!user) {
                return response.status(404).json({ message: "User not found" });
            }

            user.credits = (user.credits || 0) + Number(credits);
            await user.save();

            return response.json({ user });

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Create Subscription
    createSubscription: async (request, response) => {
        try {
            const { plan_name } = request.body;

            if (!PLAN_IDS[plan_name]) {
                return response.status(400).json({
                    message: 'Invalid plan selected'
                });
            }

            const plan = PLAN_IDS[plan_name];

            const subscription = await razorpayClient.subscriptions.create({
                plan_id: plan.id,
                customer_notify: 1,
                total_count: plan.totalBillingCycleCount,
                notes: {
                    userId: request.user._id.toString()
                }
            });

            return response.json({ subscription });

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Capture Subscription
    captureSubscription: async (request, response) => {
        try {
            const { subscriptionId } = request.body;

            const subscription = await razorpayClient.subscriptions.fetch(subscriptionId);

            const user = await Users.findById(request.user._id);
            if (!user) {
                return response.status(404).json({ message: "User not found" });
            }

            user.subscription = {
                subscriptionId: subscriptionId,
                planId: subscription.plan_id,
                status: subscription.status
            };

            await user.save();

            return response.json({ user });

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Webhook Handler
    handleWebhookEvents: async (request, response) => {
        try {
            console.log('Received Webhook Event');

            const signature = request.headers['x-razorpay-signature'];
            const body = JSON.stringify(request.body);

            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
                .update(body)
                .digest('hex');

            if (expectedSignature !== signature) {
                return response.status(400).send('Invalid signature');
            }

            const payload = request.body;

            console.log(JSON.stringify(payload, null, 2));

            const event = payload.event;
            const subscriptionData = payload.payload.subscription.entity;

            const userId = subscriptionData.notes?.userId;

            if (!userId) {
                return response.status(400).send('UserID not found in notes');
            }

            let newStatus;

            switch (event) {
                case 'subscription.activated':
                    newStatus = 'active';
                    break;
                case 'subscription.pending':
                    newStatus = 'pending';
                    break;
                case 'subscription.cancelled':
                    newStatus = 'cancelled';
                    break;
                case 'subscription.completed':
                    newStatus = 'completed';
                    break;
                default:
                    return response.status(200).send('Event ignored');
            }

            await Users.findByIdAndUpdate(userId, {
                'subscription.status': newStatus
            });

            return response.status(200).send('Webhook processed');

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal Server Error" });
        }
    }
};

module.exports = paymentsController;
