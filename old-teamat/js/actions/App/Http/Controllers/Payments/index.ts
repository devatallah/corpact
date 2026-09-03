import WebhookController from './WebhookController'
import TestGatewayController from './TestGatewayController'

const Payments = {
    WebhookController: Object.assign(WebhookController, WebhookController),
    TestGatewayController: Object.assign(TestGatewayController, TestGatewayController),
}

export default Payments