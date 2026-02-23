export function GovFooter() {
  return (
    <footer className="mt-auto w-full">
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-saffron">Important Links</h3>
              <ul className="space-y-1 text-xs text-primary-foreground/80">
                <li>National Food Security Act, 2013</li>
                <li>Public Distribution System</li>
                <li>One Nation One Ration Card</li>
                <li>PM Garib Kalyan Anna Yojana</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-saffron">Contact</h3>
              <ul className="space-y-1 text-xs text-primary-foreground/80">
                <li>Toll Free: 1800-111-555</li>
                <li>Email: helpdesk@epds.gov.in</li>
                <li>Grievance Portal: pgportal.gov.in</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-saffron">Disclaimer</h3>
              <p className="text-xs text-primary-foreground/80">
                This is an E-Governance initiative for digital management of Public Distribution System under the National Food Security Act.
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-primary-foreground/20 pt-4 text-center text-xs text-primary-foreground/60">
            <p>Content Managed by Department of Food & Public Distribution</p>
            <p className="mt-1">Designed & Developed by National Informatics Centre (NIC)</p>
          </div>
        </div>
      </div>
      {/* Bottom tricolor */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-saffron" />
        <div className="flex-1 bg-card" />
        <div className="flex-1 bg-india-green" />
      </div>
    </footer>
  )
}
