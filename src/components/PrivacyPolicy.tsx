// no React import needed for JSX with react-jsx runtime

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="muted-2 mb-4">Last updated: 2025-09-22</p>

      <div className="space-y-6 muted-2">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            HoopIQ ("we", "us", or "our") is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, and share information when you use our
            platform, including our website and related services (collectively, the "Services").
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Account information: name, email address. Authentication may be provided via
              third-party providers (e.g., Supabase auth). We store only the minimal data
              required to operate the Services.
            </li>
            <li>
              Usage data: interactions with tactics, quizzes, and progress to personalize your
              learning experience.
            </li>
            <li>
              Technical data: device information, browser type, and approximate location derived
              from IP for security and analytics.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve the Services.</li>
            <li>Personalize content, including recommended tactics and quizzes.</li>
            <li>Communicate with you about updates and support.</li>
            <li>Ensure safety, prevent fraud and abuse.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Sharing of Information</h2>
          <p>
            We do not sell your personal data. We may share information with service providers
            who help us operate the Services (e.g., hosting, analytics, authentication), under
            contracts that require them to protect the data and use it only on our behalf.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Data Retention</h2>
          <p>
            We retain personal data only for as long as necessary to provide the Services and as
            required by law. You can request deletion of your account and associated data by
            contacting us at <a className="hover:text-ink underline" href="mailto:hoopiq.pro@gmail.com">hoopiq.pro@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have rights to access, correct, or delete
            your personal data; object to or restrict certain processing; and request data
            portability. Contact us to exercise these rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Children's Privacy</h2>
          <p>
            Our Services are not directed to children under 13. We do not knowingly collect
            personal data from children. If we learn that we have done so, we will take steps to
            delete such information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the updated
            version on this page and update the "Last updated" date above.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Contact Us</h2>
          <p>
            If you have questions or requests regarding this Privacy Policy, contact us at
            {' '}<a className="hover:text-ink underline" href="mailto:hoopiq.pro@gmail.com">hoopiq.pro@gmail.com</a>, or write to us in
            Telegram, Instagram, or X.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
