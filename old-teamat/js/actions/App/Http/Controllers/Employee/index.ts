import HomeController from './HomeController'
import ExploreController from './ExploreController'
import EventController from './EventController'
import ProviderSuggestionController from './ProviderSuggestionController'
import PreferredProviderController from './PreferredProviderController'
import PaymentController from './PaymentController'
import AttendanceController from './AttendanceController'
import ResultController from './ResultController'
import EventCommentController from './EventCommentController'
import CommunityRequestController from './CommunityRequestController'
import CommunityController from './CommunityController'
import TemplateController from './TemplateController'
import CommunityExportController from './CommunityExportController'
import LeagueController from './LeagueController'
import QuickMatchController from './QuickMatchController'
import NotificationController from './NotificationController'
import ReportController from './ReportController'
import LeaderboardController from './LeaderboardController'
import ProfileController from './ProfileController'
import NotificationPreferenceController from './NotificationPreferenceController'

const Employee = {
    HomeController: Object.assign(HomeController, HomeController),
    ExploreController: Object.assign(ExploreController, ExploreController),
    EventController: Object.assign(EventController, EventController),
    ProviderSuggestionController: Object.assign(ProviderSuggestionController, ProviderSuggestionController),
    PreferredProviderController: Object.assign(PreferredProviderController, PreferredProviderController),
    PaymentController: Object.assign(PaymentController, PaymentController),
    AttendanceController: Object.assign(AttendanceController, AttendanceController),
    ResultController: Object.assign(ResultController, ResultController),
    EventCommentController: Object.assign(EventCommentController, EventCommentController),
    CommunityRequestController: Object.assign(CommunityRequestController, CommunityRequestController),
    CommunityController: Object.assign(CommunityController, CommunityController),
    TemplateController: Object.assign(TemplateController, TemplateController),
    CommunityExportController: Object.assign(CommunityExportController, CommunityExportController),
    LeagueController: Object.assign(LeagueController, LeagueController),
    QuickMatchController: Object.assign(QuickMatchController, QuickMatchController),
    NotificationController: Object.assign(NotificationController, NotificationController),
    ReportController: Object.assign(ReportController, ReportController),
    LeaderboardController: Object.assign(LeaderboardController, LeaderboardController),
    ProfileController: Object.assign(ProfileController, ProfileController),
    NotificationPreferenceController: Object.assign(NotificationPreferenceController, NotificationPreferenceController),
}

export default Employee