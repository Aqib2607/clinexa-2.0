import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-clinexa-dark py-12 lg:py-16">
        <div className="container-wide">
          <Link to="/" className="inline-flex items-center text-clinexa-secondary/80 hover:text-primary transition-colors mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="text-clinexa-secondary/90 mt-2">Last updated: February 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="container-narrow">
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <div className="bg-card rounded-xl p-6 lg:p-10 shadow-card space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
                <p>
                  Clinexa Hospital Management System ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our hospital management system and related services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
                <p className="mb-4">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personal identification information (name, date of birth, address)</li>
                  <li>Contact information (email address, phone number)</li>
                  <li>Medical history and health information</li>
                  <li>Insurance and billing information</li>
                  <li>Appointment and treatment records</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our healthcare services</li>
                  <li>Process appointments and manage your medical records</li>
                  <li>Communicate with you about your care and treatment</li>
                  <li>Send administrative information and appointment reminders</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Information Sharing</h2>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to outside parties except as described in this policy. We may share your information with healthcare providers involved in your care, insurance companies for billing purposes, and as required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest using industry-standard protocols.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your information (subject to legal requirements)</li>
                  <li>Opt-out of certain communications</li>
                  <li>File a complaint with regulatory authorities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or our practices, please contact our Privacy Officer at privacy@clinexa.com or call +1 (800) 123-4567.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
