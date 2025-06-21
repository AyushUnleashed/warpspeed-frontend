"use client"
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralEmail = urlParams.get("ref");
    if (referralEmail) {
      localStorage.setItem("ref", referralEmail);
    }
  }, []);
    return (
    <>
      <main>
        <section>
          <h1>Edit product images with AI</h1>
        </section>
        <Toaster />
      </main>
    </>
  );
}
    