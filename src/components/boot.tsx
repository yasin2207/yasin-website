"use client";

export function BootSkip() {
  return (
    <button
      type="button"
      className="boot-skip"
      onClick={() => {
        try {
          sessionStorage.setItem("chalwadi-boot", "1");
        } catch {
          /* private mode */
        }
        document.documentElement.classList.remove("booting");
      }}
    >
      Enter
    </button>
  );
}
