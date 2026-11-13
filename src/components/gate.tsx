import { SignInButton } from "./sign-bits";

export function Gate({
  kicker,
  title,
  body,
  images = [],
}: {
  kicker: string;
  title: string;
  body: string;
  images?: string[];
}) {
  return (
    <main className="gate">
      {images.length ? (
        <div className="gate-film" aria-hidden="true">
          {images.map((src) => (
            <img key={src} src={src} alt="" />
          ))}
        </div>
      ) : null}
      <div className="gate-copy">
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <SignInButton className="btn solid">Sign in</SignInButton>
      </div>
    </main>
  );
}
