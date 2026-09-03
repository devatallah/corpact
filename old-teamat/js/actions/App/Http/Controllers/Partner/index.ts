import DashboardController from './DashboardController'
import ProviderRequestController from './ProviderRequestController'
import BranchController from './BranchController'
import AvailabilityController from './AvailabilityController'
import ReliabilityController from './ReliabilityController'
import BankAccountController from './BankAccountController'
import ScheduleController from './ScheduleController'
import VenueController from './VenueController'
import SettlementController from './SettlementController'
import ReportController from './ReportController'
import ProfileController from './ProfileController'
import StaffController from './StaffController'

const Partner = {
    DashboardController: Object.assign(DashboardController, DashboardController),
    ProviderRequestController: Object.assign(ProviderRequestController, ProviderRequestController),
    BranchController: Object.assign(BranchController, BranchController),
    AvailabilityController: Object.assign(AvailabilityController, AvailabilityController),
    ReliabilityController: Object.assign(ReliabilityController, ReliabilityController),
    BankAccountController: Object.assign(BankAccountController, BankAccountController),
    ScheduleController: Object.assign(ScheduleController, ScheduleController),
    VenueController: Object.assign(VenueController, VenueController),
    SettlementController: Object.assign(SettlementController, SettlementController),
    ReportController: Object.assign(ReportController, ReportController),
    ProfileController: Object.assign(ProfileController, ProfileController),
    StaffController: Object.assign(StaffController, StaffController),
}

export default Partner