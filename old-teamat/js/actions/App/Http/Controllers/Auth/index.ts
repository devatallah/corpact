import InvitationController from './InvitationController'
import AdminAuthController from './AdminAuthController'
import EmployeeAuthController from './EmployeeAuthController'
import PartnerAuthController from './PartnerAuthController'
import CompanyAuthController from './CompanyAuthController'

const Auth = {
    InvitationController: Object.assign(InvitationController, InvitationController),
    AdminAuthController: Object.assign(AdminAuthController, AdminAuthController),
    EmployeeAuthController: Object.assign(EmployeeAuthController, EmployeeAuthController),
    PartnerAuthController: Object.assign(PartnerAuthController, PartnerAuthController),
    CompanyAuthController: Object.assign(CompanyAuthController, CompanyAuthController),
}

export default Auth