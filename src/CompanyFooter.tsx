import { InstallApp } from './InstallApp'
import { LogoTrain } from './EquipmentBrandTrain'
import socials from './footer-socials.json'
import './company-footer.css'

const official = 'https://vulcan.co.za'
const branches = [
  ['Johannesburg', '+27 11 249 8500', 'vulcan@vulcan.co.za'],
  ['Cape Town', '+27 21 510 5010', 'ctsales@vulcan.co.za'],
  ['Durban', '+27 31 569 7800', 'dbnsales@vulcan.co.za'],
  ['East London', '+27 43 722 2883', 'elsales@vulcan.co.za'],
  ['Bloemfontein', '+27 51 430 6167', 'pierres@vulcan.co.za'],
  ['Port Elizabeth', '+27 41 360 0807', 'pesales@vulcan.co.za'],
]
const important = [
  ['Products', '/products/'],
  ['Kitchen Design & Planning', '/commercial-kitchen-design-planning/'],
  ['Specials', '/specials/'],
  ['Careers', '/careers/'],
  ['Contact Us', '/contact-us/'],
]
const customerCare = [
  ['B-BBEE Certificate', '/wp-content/uploads/2026/04/VulcanCateringEquipmentPtyLtd_G25J07743A.pdf'],
  ['B-BBEE Annexure', '/wp-content/uploads/2026/01/B-BBEE-Annexure.pdf'],
  ['PAIA Disclaimer', '/wp-content/uploads/2026/03/Vulcan-PAIA-Manual-February-2026-Updated-Version.pdf'],
  ['Consumer Protection Act', '/wp-content/uploads/2026/01/Consumer-Protection-Act.pdf'],
  ['POPI Policy', '/wp-content/uploads/2026/03/Vulcan-POPI-Policy-November-2025-Updated-Version.pdf'],
]
const logos = [
  ['Bidvest', 'Bidvest-Logo.png'],
  ['YES Verification Badge', 'YES_Verification_Badge.png'],
  ['LPGSA', 'LPGSA.png'],
  ['FICA Compliant', 'FICA-Compliant.png'],
  ['B-BBEE', 'B-BBEE.png'],
  ['UTAL', 'UTAL-Logo.jpg'],
  ['FEDHASA Member', 'FEDHASA-Member-Logo-2.webp'],
]
const dial = (number: string) => 'tel:' + number.replaceAll(' ', '')
const icons = {
  phone: 'M7 3H4a1 1 0 00-1 1c0 9.4 7.6 17 17 17a1 1 0 001-1v-3l-5-2-2 2a13 13 0 01-7-7l2-2z',
  mail: 'M3 5h18v14H3z M3 6l9 7 9-7',
  arrow: 'm9 6 6 6-6 6',
}

function Icon({ name }: { name: keyof typeof icons }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={icons[name]} /></svg>
}

function FooterLinks({ title, items }: { title: string; items: string[][] }) {
  return <nav aria-label={title}>
    <h2>{title}</h2>
    <ul>{items.map(([label, path]) => <li key={label}><a href={official + path}><Icon name="arrow" />{label}</a></li>)}</ul>
  </nav>
}

const youtubeChannel: string | undefined = undefined

export function CompanyFooter() {
  return <footer className="company-footer">
    <section className="footer-branches" aria-label="Vulcan branches">
      <div className="shell footer-branch-grid">
        {branches.map(([name, phone, email]) => <section className="footer-branch" key={name}>
          <h2>{name}</h2>
          <a href={dial(phone)}><Icon name="phone" />{phone}</a>
          <a href={`mailto:${email}`}><Icon name="mail" />{email}</a>
        </section>)}
      </div>
    </section>
    <div className="footer-information">
      <div className="shell footer-information-grid">
        <section>
          <h2>Innovation Through Experience</h2>
          <p>For 70 years, Vulcan’s team has brought technical expertise to manufacturing and supplying commercial and industrial catering equipment for the South African and Sub-Saharan food service markets.</p>
        </section>
        <FooterLinks title="Important Links" items={important} />
        <FooterLinks title="Customer Care" items={customerCare} />
        <section>
          <h2>Contact Us</h2>
          <dl className="footer-contact">
            <div><dt><Icon name="phone" />Head Office</dt><dd><a href="tel:0112498500">011 249 8500</a></dd></div>
            <div><dt><Icon name="phone" />National Service Desk</dt><dd><a href="tel:0860000309">0860 000 309</a></dd></div>
          </dl>
          <InstallApp />
        </section>
      </div>
    </div>
    <section className="shell follow-us" aria-labelledby="follow-us-title">
      <h2 id="follow-us-title">FOLLOW US</h2>
      <div className="follow-us-tiles">
        {['Facebook', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn'].map(name => {
          const account = socials.find(item => item.name === name)
          if (account) return <a href={account.href} aria-label={name} title={name} key={name} data-platform={name}>
            <svg aria-hidden="true" viewBox={account.viewBox} fill="currentColor"><path d={account.path} /></svg>
          </a>
          const icon = <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="4" fill="currentColor" /><path d="m10 8 6 4-6 4Z" fill="#a81719" /></svg>
          return youtubeChannel
            ? <a key={name} href={youtubeChannel} aria-label={name} data-platform={name}>{icon}</a>
            : <span key={name} role="img" aria-label="YouTube channel awaiting confirmation" title="YouTube channel awaiting confirmation" data-platform={name}>{icon}</span>
        })}
      </div>
    </section>
    <div className="footer-partners" aria-label="Partners and certifications">
      <LogoTrain logos={logos.map(([name, file]) => ({ name, src: `${import.meta.env.BASE_URL}footer/${file}` }))} />
    </div>
    <div className="footer-credit">
      <p>© 2026 Vulcan. All rights reserved.</p>
      <p>Designed &amp; Developed by <a href="https://innerwork-digital-rr2x.vercel.app/" target="_blank" rel="noopener noreferrer">Innerwork Digital</a></p>
    </div>
  </footer>
}

