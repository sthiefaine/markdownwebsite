"use server";

import { App } from "@/components/app";
import { Suspense } from "react";

export default async function Home() {
  return (
    <>
      <Suspense>
        <App />
      </Suspense>
    </>
  );
}
