import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "VocaBoost — Daily Vocabulary Trainer",
  description:
    "Improve your interview and research paper vocabulary with daily practice, flashcards, and quizzes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex flex-col md:flex-row min-h-screen">
          <Navigation />
          <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
