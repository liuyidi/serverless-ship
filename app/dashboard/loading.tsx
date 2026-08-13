export default function DashboardLoading() {
  return (
    <main className="adminPage adminLoadingPage">
      <section className="adminHeroCard">
        <div className="adminHeroCopy">
          <div className="adminSectionKicker">Dashboard</div>
          <div className="adminLoadingLine adminLoadingLineShort" />
          <div className="adminLoadingLine adminLoadingLineWide" />
          <div className="adminLoadingPills">
            <span className="adminLoadingPill" />
            <span className="adminLoadingPill" />
            <span className="adminLoadingPill" />
          </div>
        </div>
        <div className="adminLoadingStats">
          <div className="adminLoadingCard" />
          <div className="adminLoadingCard" />
          <div className="adminLoadingCard" />
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHeader">
          <div className="adminLoadingBlock">
            <div className="adminLoadingLine adminLoadingLineShort" />
            <div className="adminLoadingLine adminLoadingLineWide" />
          </div>
          <div className="adminLoadingButton" />
        </div>

        <div className="adminLoadingForm">
          <div className="adminLoadingInput" />
          <div className="adminLoadingInput" />
          <div className="adminLoadingInput" />
          <div className="adminLoadingInput" />
          <div className="adminLoadingInput" />
          <div className="adminLoadingInput" />
          <div className="adminLoadingActions">
            <div className="adminLoadingButton" />
            <div className="adminLoadingButton adminLoadingButtonSecondary" />
          </div>
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminLoadingTable">
          <div className="adminLoadingTableHeader" />
          <div className="adminLoadingTableRow" />
          <div className="adminLoadingTableRow" />
          <div className="adminLoadingTableRow" />
        </div>
      </section>
    </main>
  );
}
