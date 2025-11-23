import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p className="mb-4">
                Welcome to Health App ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medical shop application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2.1 Personal Information</h3>
              <p className="mb-3">We may collect the following personal information:</p>
              <ul className="list-disc list-inside mb-4 space-y-1 ml-4">
                <li>Name and contact information (email address, phone number)</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
                <li>Medical prescriptions and health-related information you choose to provide</li>
                <li>Account credentials and authentication information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">2.2 Usage Information</h3>
              <ul className="list-disc list-inside mb-4 space-y-1 ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, products viewed, time spent on site)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside mb-4 space-y-1 ml-4">
                <li>To process and fulfill your orders</li>
                <li>To manage your account and provide customer support</li>
                <li>To communicate with you about your orders, products, and services</li>
                <li>To improve our website, products, and services</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To comply with legal obligations and protect our rights</li>
                <li>To authenticate and verify your identity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Information Sharing and Disclosure</h2>
              <p className="mb-3">We may share your information in the following circumstances:</p>
              <ul className="list-disc list-inside mb-4 space-y-1 ml-4">
                <li><strong>Service Providers:</strong> With third-party service providers who assist us in operating our website and conducting business</li>
                <li><strong>Payment Processors:</strong> With payment processors to complete transactions</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Google OAuth Authentication</h2>
              <p className="mb-4">
                When you choose to sign in with Google, we collect and store:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1 ml-4">
                <li>Your Google account email address</li>
                <li>Your name and profile picture (if available)</li>
                <li>Your Google account ID (for authentication purposes)</li>
              </ul>
              <p className="mb-4">
                This information is used solely for authentication and account management. We do not access or store your Google password or other Google account data beyond what is necessary for authentication.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside mb-4 space-y-1 ml-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate or incomplete data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Withdraw consent at any time (where processing is based on consent)</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookie preferences through your browser settings. However, disabling cookies may affect the functionality of our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Third-Party Links</h2>
              <p className="mb-4">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
              <p className="mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2"><strong>Email:</strong> dev.mayuribharti@gmail.com</p>
                <p><strong>Support Email:</strong> dev.mayuribharti@gmail.com</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PrivacyPolicy

