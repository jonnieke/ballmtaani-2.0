import React, { useState } from "react";
import { Route, Switch } from "wouter";
import { Navbar } from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MatchDetailPage from "./pages/MatchDetailPage";
import NewsPage from "./pages/NewsPage";
import LiveCenterPage from "./pages/LiveCenterPage";
import AIFanZonePage from "./pages/AIFanZonePage";
import TeamDetailPage from "./pages/TeamDetailPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MarketHomePage from "./pages/MarketHomePage";
import PredictionReceiptPage from "./pages/PredictionReceiptPage";
import { ChooseClubModal } from "./components/ChooseClubModal";

// BallMtaani Edge Phase 2 - 6 Pages
import AdminEdgePage from "./pages/edge/AdminEdgePage";
import EdgeLandingPage from "./pages/edge/EdgeLandingPage";
import EdgeMatchListingPage from "./pages/edge/EdgeMatchListingPage";
import EdgeMatchDetailPage from "./pages/edge/EdgeMatchDetailPage";
import EdgePerformancePage from "./pages/edge/EdgePerformancePage";
import EdgeHowItWorksPage from "./pages/edge/EdgeHowItWorksPage";
import EdgeModelsPage from "./pages/edge/EdgeModelsPage";
import EdgePricingPreviewPage from "./pages/edge/EdgePricingPreviewPage";
import AccountEdgePage from "./pages/edge/AccountEdgePage";
import EdgeForYouPage from "./pages/edge/EdgeForYouPage";
import PartnerDeveloperPortalPage from "./pages/edge/PartnerDeveloperPortalPage";
import MobileAppPreviewView from "./components/edge/MobileAppPreviewView";
import TenantNewsroomPage from "./pages/edge/TenantNewsroomPage";
import EnterpriseDashboardPage from "./pages/edge/EnterpriseDashboardPage";
import EdgeLitePage from "./pages/edge/EdgeLitePage";
import TelecomPartnerPortalPage from "./pages/edge/TelecomPartnerPortalPage";
import ExecutiveDashboardPage from "./pages/edge/ExecutiveDashboardPage";
import PublicTrustCentrePage from "./pages/edge/PublicTrustCentrePage";
import LaunchCommandCenterPage from "./pages/edge/LaunchCommandCenterPage";
import InvestorDashboardPage from "./pages/edge/InvestorDashboardPage";
import LaunchHelpCentrePage from "./pages/edge/LaunchHelpCentrePage";
import PartnershipPipelinePage from "./pages/edge/PartnershipPipelinePage";
import ExpansionScorecardsPage from "./pages/edge/ExpansionScorecardsPage";

// BallMtaani Edge Phase 13 — Scaled Growth, Self-Service Partners & Regional Expansion
import ScaledOperationsDashboardPage from "./pages/edge/ScaledOperationsDashboardPage";
import ScaleProgrammesPage from "./pages/edge/ScaleProgrammesPage";
import PartnerApplicationsPage from "./pages/edge/PartnerApplicationsPage";
import SelfServicePartnersPage from "./pages/edge/SelfServicePartnersPage";
import B2bBillingPage from "./pages/edge/B2bBillingPage";
import UsageLedgerPage from "./pages/edge/UsageLedgerPage";
import CustomerSuccessPage from "./pages/edge/CustomerSuccessPage";
import SalesOperationsPage from "./pages/edge/SalesOperationsPage";
import RegionalMarketsPage from "./pages/edge/RegionalMarketsPage";
import PaymentProvidersPage from "./pages/edge/PaymentProvidersPage";
import PortfolioOptimizationPage from "./pages/edge/PortfolioOptimizationPage";
import RevenueRetentionPage from "./pages/edge/RevenueRetentionPage";
import CapitalAllocationPage from "./pages/edge/CapitalAllocationPage";
import PartnerOnboardingPage from "./pages/edge/PartnerOnboardingPage";
import PartnerHelpCentrePage from "./pages/edge/PartnerHelpCentrePage";

// BallMtaani Edge Phase 14 — Cross-Sport, Marketplace, Corporate & Investment
import SportsHubPage from "./pages/edge/SportsHubPage";
import SportOpportunitiesPage from "./pages/edge/SportOpportunitiesPage";
import MarketplacePage from "./pages/edge/MarketplacePage";
import MarketplaceAdminPage from "./pages/edge/MarketplaceAdminPage";
import SellerApplicationsPage from "./pages/edge/SellerApplicationsPage";
import CorporateRecordsPage from "./pages/edge/CorporateRecordsPage";
import CapTablePage from "./pages/edge/CapTablePage";
import IpRegisterPage from "./pages/edge/IpRegisterPage";
import InvestorPipelinePage from "./pages/edge/InvestorPipelinePage";
import DiligenceRoomPage from "./pages/edge/DiligenceRoomPage";
import ExitReadinessPage from "./pages/edge/ExitReadinessPage";
import StrategicTransactionsPage from "./pages/edge/StrategicTransactionsPage";

export default function App() {
  const [isChooseClubOpen, setIsChooseClubOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#B30000] selection:text-white">
      <Navbar />

      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/match/:id" component={MatchDetailPage} />
          <Route path="/news" component={NewsPage} />
          <Route path="/live" component={LiveCenterPage} />
          <Route path="/ai-fanzone" component={AIFanZonePage} />
          <Route path="/team/:id" component={TeamDetailPage} />
          
          {/* Edge Intelligence Engine Public & Account Routes */}
          <Route path="/edge" component={EdgeLandingPage} />
          <Route path="/edge/for-you" component={EdgeForYouPage} />
          <Route path="/edge/today" component={EdgeMatchListingPage} />
          <Route path="/edge/tomorrow" component={EdgeMatchListingPage} />
          <Route path="/edge/upcoming" component={EdgeMatchListingPage} />
          <Route path="/edge/match/:fixtureId" component={EdgeMatchDetailPage} />
          <Route path="/edge/performance" component={EdgePerformancePage} />
          <Route path="/edge/how-it-works" component={EdgeHowItWorksPage} />
          <Route path="/edge/models" component={EdgeModelsPage} />
          <Route path="/edge/pricing-preview" component={EdgePricingPreviewPage} />
          <Route path="/account/edge" component={AccountEdgePage} />
          <Route path="/partners/edge/developers" component={PartnerDeveloperPortalPage} />
          <Route path="/mobile/preview" component={MobileAppPreviewView} />
          <Route path="/tenant/newsroom" component={TenantNewsroomPage} />
          <Route path="/tenant/dashboard" component={EnterpriseDashboardPage} />
          <Route path="/edge/lite" component={EdgeLitePage} />
          <Route path="/partners/telecom" component={TelecomPartnerPortalPage} />
          <Route path="/edge/trust" component={PublicTrustCentrePage} />
          <Route path="/edge/help" component={LaunchHelpCentrePage} />

          {/* Platform Admin */}
          <Route path="/admin" component={AdminDashboardPage} />
          <Route path="/admin/edge" component={AdminEdgePage} />
          <Route path="/admin/edge/executive" component={ExecutiveDashboardPage} />
          <Route path="/admin/edge/launch" component={LaunchCommandCenterPage} />
          <Route path="/admin/edge/investor" component={InvestorDashboardPage} />
          <Route path="/admin/edge/partnerships" component={PartnershipPipelinePage} />
          <Route path="/admin/edge/expansion" component={ExpansionScorecardsPage} />

          {/* Phase 13 — Scaled Operations Admin */}
          <Route path="/admin/edge/scaled" component={ScaledOperationsDashboardPage} />
          <Route path="/admin/edge/scale-programmes" component={ScaleProgrammesPage} />
          <Route path="/admin/edge/partner-applications" component={PartnerApplicationsPage} />
          <Route path="/admin/edge/self-service-partners" component={SelfServicePartnersPage} />
          <Route path="/admin/edge/b2b-billing" component={B2bBillingPage} />
          <Route path="/admin/edge/usage-ledger" component={UsageLedgerPage} />
          <Route path="/admin/edge/customer-success" component={CustomerSuccessPage} />
          <Route path="/admin/edge/sales" component={SalesOperationsPage} />
          <Route path="/admin/edge/regional-markets" component={RegionalMarketsPage} />
          <Route path="/admin/edge/payment-providers" component={PaymentProvidersPage} />
          <Route path="/admin/edge/portfolio" component={PortfolioOptimizationPage} />
          <Route path="/admin/edge/revenue-retention" component={RevenueRetentionPage} />
          <Route path="/admin/edge/capital-allocation" component={CapitalAllocationPage} />

          {/* Phase 13 — Partner Public Routes */}
          <Route path="/partners/onboarding" component={PartnerOnboardingPage} />
          <Route path="/partners/help" component={PartnerHelpCentrePage} />

          {/* Phase 14 — Cross-Sport Public Routes */}
          <Route path="/sports" component={SportsHubPage} />
          <Route path="/marketplace" component={MarketplacePage} />

          {/* Phase 14 — Admin: Sports & Marketplace */}
          <Route path="/admin/edge/sport-opportunities" component={SportOpportunitiesPage} />
          <Route path="/admin/edge/marketplace" component={MarketplaceAdminPage} />
          <Route path="/admin/edge/seller-applications" component={SellerApplicationsPage} />

          {/* Phase 14 — Admin: Corporate (Restricted) */}
          <Route path="/admin/edge/corporate" component={CorporateRecordsPage} />
          <Route path="/admin/edge/cap-table" component={CapTablePage} />
          <Route path="/admin/edge/ip-register" component={IpRegisterPage} />

          {/* Phase 14 — Admin: Investment & Exit (Restricted) */}
          <Route path="/admin/edge/investor-pipeline" component={InvestorPipelinePage} />
          <Route path="/admin/edge/diligence" component={DiligenceRoomPage} />
          <Route path="/admin/edge/exit-readiness" component={ExitReadinessPage} />
          <Route path="/admin/edge/strategic-transactions" component={StrategicTransactionsPage} />
          
          <Route path="/markets" component={MarketHomePage} />
          <Route path="/receipt/:id" component={PredictionReceiptPage} />
          <Route>
            <div className="container mx-auto px-4 py-20 text-center">
              <h1 className="text-4xl font-extrabold mb-4">404 - Page Not Found</h1>
              <p className="text-gray-400 mb-8">The page you are looking for does not exist.</p>
              <a href="/" className="bg-[#B30000] text-white px-6 py-3 rounded-lg font-bold">Return Home</a>
            </div>
          </Route>
        </Switch>
      </main>

      <ChooseClubModal isOpen={isChooseClubOpen} onClose={() => setIsChooseClubOpen(false)} />
    </div>
  );
}
