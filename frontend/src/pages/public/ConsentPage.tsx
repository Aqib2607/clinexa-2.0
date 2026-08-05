import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ConsentPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-clinexa-dark py-12 lg:py-16">
        <div className="container-wide">
          <Link to="/" className="inline-flex items-center text-clinexa-secondary/80 hover:text-primary transition-colors mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Consent Policy</h1>
          <p className="text-clinexa-secondary/90 mt-2">Last updated: February 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="container-narrow">
          <div className="bg-card rounded-xl p-6 lg:p-10 shadow-card space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Purpose of This Policy</h2>
              <p className="text-muted-foreground">
                This Consent Policy outlines how Clinexa Hospital Management System obtains, manages, and documents patient consent for medical treatments, data processing, and other healthcare-related activities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Types of Consent</h2>
              <p className="text-muted-foreground mb-4">We obtain consent in the following forms:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Informed Consent:</strong> For medical procedures and treatments, where risks and benefits are explained</li>
                <li><strong>General Consent:</strong> For routine examinations and standard care</li>
                <li><strong>Data Processing Consent:</strong> For collection and use of personal health information</li>
                <li><strong>Research Consent:</strong> For participation in clinical studies (when applicable)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Informed Consent Process</h2>
              <p className="text-muted-foreground mb-4">
                Before any significant medical procedure, we ensure that patients:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Understand the nature of the proposed treatment</li>
                <li>Are informed of potential risks and benefits</li>
                <li>Know about alternative treatment options</li>
                <li>Have the opportunity to ask questions</li>
                <li>Voluntarily agree to the procedure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Capacity to Consent</h2>
              <p className="text-muted-foreground">
                Consent must be given by individuals who have the mental capacity to understand and make decisions about their care. For patients who lack capacity, consent may be obtained from legally authorized representatives, guardians, or through advance directives.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Withdrawal of Consent</h2>
              <p className="text-muted-foreground">
                Patients have the right to withdraw their consent at any time. Withdrawal of consent must be communicated to healthcare providers and will be documented in the patient's medical record. Withdrawal does not affect the lawfulness of processing based on consent before its withdrawal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Emergency Situations</h2>
              <p className="text-muted-foreground">
                In emergency situations where the patient is unable to provide consent and no authorized representative is available, treatment necessary to preserve life or prevent serious harm may be provided without prior consent, in accordance with applicable laws and medical ethics.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Minor Patients</h2>
              <p className="text-muted-foreground">
                For patients under the age of 18, consent must generally be obtained from a parent or legal guardian. Certain exceptions may apply based on local laws regarding mature minors or specific types of care.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Documentation</h2>
              <p className="text-muted-foreground">
                All consent forms are securely stored within our hospital management system. Patients can request copies of their consent documentation at any time through the patient portal or by contacting our records department.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground">
                For questions about consent or to exercise your rights, please contact our Patient Relations department at consent@clinexa.com or call +1 (800) 123-4567.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
