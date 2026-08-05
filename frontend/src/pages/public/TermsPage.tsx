import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-clinexa-dark py-12 lg:py-16">
        <div className="container-wide">
          <Link to="/" className="inline-flex items-center text-clinexa-secondary/80 hover:text-primary transition-colors mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Terms of Service</h1>
          <p className="text-clinexa-secondary/90 mt-2">Last updated: February 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="container-narrow">
          <div className="bg-card rounded-xl p-6 lg:p-10 shadow-card space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using the Clinexa Hospital Management System, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Description of Services</h2>
              <p className="text-muted-foreground">
                Clinexa provides a comprehensive hospital management system that includes patient registration, appointment scheduling, medical records management, billing, and related healthcare administrative services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                To access certain features, you may need to create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Acceptable Use</h2>
              <p className="text-muted-foreground mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the system for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any part of the system</li>
                <li>Interfere with or disrupt the system's functionality</li>
                <li>Upload malicious code or harmful content</li>
                <li>Share your login credentials with unauthorized persons</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Medical Disclaimer</h2>
              <p className="text-muted-foreground">
                The information provided through our system is for informational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals for medical decisions. In case of emergency, contact emergency services immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content, features, and functionality of the Clinexa system are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, Clinexa shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the system.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the system constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us at legal@clinexa.com or +1 (800) 123-4567.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
