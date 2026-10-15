"use client";

import React from "react";
import { MessageSquare, QrCode, ExternalLink } from "lucide-react";

export default function FeedbackPage() {
  const feedbackFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeq6HR3UCDNRB6CSyR1VAj9roPHNGtMt-RPFcGgxiiyAxGAgA/viewform?usp=dialog";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-sans text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-primary" />
          <span>Feedback</span>
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Your response matters to us.
        </p>
      </div>

      <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center justify-center w-full md:w-56">
            <div className="rounded-2xl border border-primary/10 bg-background/60 p-4">
              <img
                src="/qrcode.png"
                alt="Feedback form QR code"
                className="w-40 h-40 rounded-xl border border-primary/10 bg-white p-2"
              />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <QrCode className="w-5 h-5" />
              <h2 className="font-sans text-lg font-extrabold">Scan to share your feedback</h2>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Use the QR code or open the form below to share your experience and suggestions.
            </p>

            <a
              href={feedbackFormUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md border-b-4 border-primary/30"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Feedback Form</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
