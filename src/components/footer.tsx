import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <p className="eyebrow">Chalwadi Enterprise</p>
          <p>Deccan Gymkhana, Pune. A register of houses for sale and houses to let, kept since 2014.</p>
        </div>
        <div>
          <p className="eyebrow">The book</p>
          <p><Link href="/register">The register</Link></p>
          <p><Link href="/file">File a house</Link></p>
          <p><Link href="/desk">Your desk</Link></p>
        </div>
        <div>
          <p className="eyebrow">Prototype</p>
          <p>Houses marked Sample are not on the market. Photographs are stand-ins from Unsplash. A filing made here is stored for this app, and the seal on a new filing is immediate.</p>
        </div>
      </div>
      <p className="footer-mark">Chalwadi</p>
    </footer>
  );
}
