import type { Metadata } from "next";
import TrackerPage from "@/components/tracker/TrackerPage";

export const metadata: Metadata = {
  title: "Practice — Guitar Cave",
  description: "The daily loop and skill grades. Two sessions a day; the strum is time.",
};

export default function Home() {
  return <TrackerPage />;
}
