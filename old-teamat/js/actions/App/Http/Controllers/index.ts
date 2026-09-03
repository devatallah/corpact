import SupportMessageController from './SupportMessageController'
import Payments from './Payments'
import Auth from './Auth'
import Admin from './Admin'
import Coordinator from './Coordinator'
import Partner from './Partner'
import Company from './Company'
import Employee from './Employee'

const Controllers = {
    SupportMessageController: Object.assign(SupportMessageController, SupportMessageController),
    Payments: Object.assign(Payments, Payments),
    Auth: Object.assign(Auth, Auth),
    Admin: Object.assign(Admin, Admin),
    Coordinator: Object.assign(Coordinator, Coordinator),
    Partner: Object.assign(Partner, Partner),
    Company: Object.assign(Company, Company),
    Employee: Object.assign(Employee, Employee),
}

export default Controllers