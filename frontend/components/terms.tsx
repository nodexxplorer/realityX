import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. We reserve the right to make changes to our terms at any time. If any of these conditions shall be found invalid, void, or for any reason unenforceable, that condition shall be severable and shall not affect the validity and enforceability of any remaining condition.`
  },
  {
    id: 'usage',
    title: '2. Use License',
    content: `Permission is granted to temporarily download one copy of the materials (information or software) on our service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

• Modifying or copying the materials
• Using the materials for any commercial purpose or for any public display
• Attempting to decompile or reverse engineer any software contained on the service
• Removing any copyright or other proprietary notations from the materials
• Transferring the materials to another person or "mirroring" the materials on any other server
• Using the materials in any way that is illegal or violates these terms
• Accessing or searching the service by any means other than our publicly supported interfaces

Breach of any of these shall result in immediate and automatic termination of your right to use this service.`
  },
  {
    id: 'disclaimer',
    title: '3. Disclaimer',
    content: `The materials on our service are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

Further, we do not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet web site or otherwise relating to such materials or on any sites linked to this site.`
  },
  {
    id: 'limitations',
    title: '4. Limitations of Liability',
    content: `In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our service, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.

Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.`
  },
  {
    id: 'accuracy',
    title: '5. Accuracy of Materials',
    content: `The materials appearing on our service could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our service are accurate, complete, or current. We may make changes to the materials contained on our service at any time without notice.

We do not, however, make any commitment to update the materials.`
  },
  {
    id: 'links',
    title: '6. Links',
    content: `We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.

If you find any link on our service objectionable for any reason, contact us and we will consider removing that link.`
  },
  {
    id: 'modifications',
    title: '7. Modifications',
    content: `We may revise these terms of service at any time without notice. By using this service, you are agreeing to be bound by the then current version of these terms of service.

If the terms of service are changed, your sole remedy is to discontinue use of our service. Continued use of our service following the posting of revised terms means that you accept and agree to the changes.`
  },
  {
    id: 'govern',
    title: '8. Governing Law',
    content: `These terms and conditions are governed by and construed in accordance with the laws of [Your Country/State] and you irrevocably submit to the exclusive jurisdiction of the courts located in that location.`
  },
  {
    id: 'userContent',
    title: '9. User Content',
    content: `Any information, data, text, software, music, sound, photographs, graphics, video, messages, or other materials (collectively, "User Content") that you transmit, publish or display on our service shall be owned by you or you shall have obtained all necessary licenses.

By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content in connection with our service. You retain all rights to your User Content, but by submitting it, you grant us permission to use it as described above.

You warrant that you have all necessary rights to the User Content and that it does not violate any third-party intellectual property rights.`
  },
  {
    id: 'conduct',
    title: '10. Code of Conduct',
    content: `When using our service, you agree not to:

• Harass, threaten, embarrass, or cause distress or discomfort to any individual
• Obscene or abusive language or expression
• Disrupt the normal flow of dialogue within our service
• Send unsolicited advertising or promotional materials
• Attempt to gain unauthorized access to our systems
• Transmit any viruses or other harmful code
• Engage in any illegal activity or violate any applicable laws
• Use the service for any commercial purpose without our express written consent

Violation of these rules may result in suspension or termination of your account.`
  },
  {
    id: 'privacy',
    title: '11. Privacy Policy',
    content: `Your use of our service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices. By using this service, you acknowledge that you have read and agree to be bound by our Privacy Policy.`
  },
  {
    id: 'intellectual',
    title: '12. Intellectual Property Rights',
    content: `All content included on our service, such as text, graphics, logos, images, audio clips, digital downloads, data compilations, and software, is the property of our company or its content suppliers and protected by international copyright laws.

You are granted a limited license to access and use the content for your personal, non-commercial use only. You may not reproduce, distribute, transmit, display, or otherwise use any of the materials without the prior written permission of us or the respective content owners.`
  },
  {
    id: 'termination',
    title: '13. Termination of Service',
    content: `We reserve the right to terminate your access to our service at any time without notice for conduct that we believe violates these terms or is harmful to other users, us, or third parties, or for any other reason in our sole discretion.

Upon termination, your right to use the service will immediately cease. All provisions of these terms which by their nature should survive termination shall survive.`
  },
  {
    id: 'contact',
    title: '14. Contact Information',
    content: `If you have any questions about these Terms and Conditions, please contact us at:

Email: legal@example.com
Address: 123 Business Street, City, State ZIP
Phone: +1 (555) 123-4567

We will make every effort to resolve any issues or concerns you may have regarding this service.`
  }
];

export default function TermsAndConditions() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [allExpanded, setAllExpanded] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllSections = () => {
    if (allExpanded) {
      setExpandedSections([]);
    } else {
      setExpandedSections(sections.map(s => s.id));
    }
    setAllExpanded(!allExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Terms and Conditions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Introduction */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 mb-8">
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
            Welcome to our service. These Terms and Conditions ("Terms") govern your use of our website, 
            applications, and services (collectively, the "Service"). Please read these Terms carefully. 
            By accessing or using our Service, you agree to be bound by these Terms. If you do not agree 
            to any part of these Terms, you may not use our Service.
          </p>
        </div>

        {/* Expand All Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Sections
          </h2>
          <button
            onClick={toggleAllSections}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-4 mb-8">
          {sections.map(section => (
            <div
              key={section.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-left">
                  {section.title}
                </h3>
                {expandedSections.includes(section.id) ? (
                  <ChevronUp size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0 ml-2" />
                )}
              </button>

              {expandedSections.includes(section.id) && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Agreement Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 mb-8">
          <label className="flex items-start gap-3 sm:gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-1 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              I have read and agree to the Terms and Conditions above. I understand that by using this 
              service, I am agreeing to be bound by all the terms outlined.
            </span>
          </label>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              disabled={!agreed}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                agreed
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check size={18} />
              I Agree & Continue
            </button>
            <Link href="/">
              <button className="flex-1 px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                Back
              </button>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6 text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            <strong>Note:</strong> These Terms and Conditions are subject to change at any time. 
            We recommend reviewing them periodically for updates.
          </p>
          <p>
            For questions about these terms, please contact our support team at legal@example.com
          </p>
        </div>
      </div>
    </div>
  );
}









// import React, { useState } from 'react';
// import { ChevronDown, ChevronUp, Check } from 'lucide-react';

// const sections = [
//   {
//     id: 'acceptance',
//     title: '1. Acceptance of Terms',
//     content: `By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. We reserve the right to make changes to our terms at any time. If any of these conditions shall be found invalid, void, or for any reason unenforceable, that condition shall be severable and shall not affect the validity and enforceability of any remaining condition.`
//   },
//   {
//     id: 'usage',
//     title: '2. Use License',
//     content: `Permission is granted to temporarily download one copy of the materials (information or software) on our service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

// • Modifying or copying the materials
// • Using the materials for any commercial purpose or for any public display
// • Attempting to decompile or reverse engineer any software contained on the service
// • Removing any copyright or other proprietary notations from the materials
// • Transferring the materials to another person or "mirroring" the materials on any other server
// • Using the materials in any way that is illegal or violates these terms
// • Accessing or searching the service by any means other than our publicly supported interfaces

// Breach of any of these shall result in immediate and automatic termination of your right to use this service.`
//   },
//   {
//     id: 'disclaimer',
//     title: '3. Disclaimer',
//     content: `The materials on our service are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

// Further, we do not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet web site or otherwise relating to such materials or on any sites linked to this site.`
//   },
//   {
//     id: 'limitations',
//     title: '4. Limitations of Liability',
//     content: `In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our service, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.

// Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.`
//   },
//   {
//     id: 'accuracy',
//     title: '5. Accuracy of Materials',
//     content: `The materials appearing on our service could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our service are accurate, complete, or current. We may make changes to the materials contained on our service at any time without notice.

// We do not, however, make any commitment to update the materials.`
//   },
//   {
//     id: 'links',
//     title: '6. Links',
//     content: `We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.

// If you find any link on our service objectionable for any reason, contact us and we will consider removing that link.`
//   },
//   {
//     id: 'modifications',
//     title: '7. Modifications',
//     content: `We may revise these terms of service at any time without notice. By using this service, you are agreeing to be bound by the then current version of these terms of service.

// If the terms of service are changed, your sole remedy is to discontinue use of our service. Continued use of our service following the posting of revised terms means that you accept and agree to the changes.`
//   },
//   {
//     id: 'govern',
//     title: '8. Governing Law',
//     content: `These terms and conditions are governed by and construed in accordance with the laws of [Your Country/State] and you irrevocably submit to the exclusive jurisdiction of the courts located in that location.`
//   },
//   {
//     id: 'userContent',
//     title: '9. User Content',
//     content: `Any information, data, text, software, music, sound, photographs, graphics, video, messages, or other materials (collectively, "User Content") that you transmit, publish or display on our service shall be owned by you or you shall have obtained all necessary licenses.

// By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content in connection with our service. You retain all rights to your User Content, but by submitting it, you grant us permission to use it as described above.

// You warrant that you have all necessary rights to the User Content and that it does not violate any third-party intellectual property rights.`
//   },
//   {
//     id: 'conduct',
//     title: '10. Code of Conduct',
//     content: `When using our service, you agree not to:

// • Harass, threaten, embarrass, or cause distress or discomfort to any individual
// • Obscene or abusive language or expression
// • Disrupt the normal flow of dialogue within our service
// • Send unsolicited advertising or promotional materials
// • Attempt to gain unauthorized access to our systems
// • Transmit any viruses or other harmful code
// • Engage in any illegal activity or violate any applicable laws
// • Use the service for any commercial purpose without our express written consent

// Violation of these rules may result in suspension or termination of your account.`
//   },
//   {
//     id: 'privacy',
//     title: '11. Privacy Policy',
//     content: `Your use of our service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices. By using this service, you acknowledge that you have read and agree to be bound by our Privacy Policy.`
//   },
//   {
//     id: 'intellectual',
//     title: '12. Intellectual Property Rights',
//     content: `All content included on our service, such as text, graphics, logos, images, audio clips, digital downloads, data compilations, and software, is the property of our company or its content suppliers and protected by international copyright laws.

// You are granted a limited license to access and use the content for your personal, non-commercial use only. You may not reproduce, distribute, transmit, display, or otherwise use any of the materials without the prior written permission of us or the respective content owners.`
//   },
//   {
//     id: 'termination',
//     title: '13. Termination of Service',
//     content: `We reserve the right to terminate your access to our service at any time without notice for conduct that we believe violates these terms or is harmful to other users, us, or third parties, or for any other reason in our sole discretion.

// Upon termination, your right to use the service will immediately cease. All provisions of these terms which by their nature should survive termination shall survive.`
//   },
//   {
//     id: 'contact',
//     title: '14. Contact Information',
//     content: `If you have any questions about these Terms and Conditions, please contact us at:

// Email: legal@example.com
// Address: 123 Business Street, City, State ZIP
// Phone: +1 (555) 123-4567

// We will make every effort to resolve any issues or concerns you may have regarding this service.`
//   }
// ];

// export default function TermsAndConditions() {
//   const [expandedSections, setExpandedSections] = useState<string[]>([]);
//   const [allExpanded, setAllExpanded] = useState(false);
//   const [agreed, setAgreed] = useState(false);

//   const toggleSection = (id: string) => {
//     setExpandedSections(prev =>
//       prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
//     );
//   };

//   const toggleAllSections = () => {
//     if (allExpanded) {
//       setExpandedSections([]);
//     } else {
//       setExpandedSections(sections.map(s => s.id));
//     }
//     setAllExpanded(!allExpanded);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
//       {/* Header */}
//       <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
//           <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
//             Terms and Conditions
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
//             Last updated: {new Date().toLocaleDateString()}
//           </p>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
//         {/* Introduction */}
//         <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 mb-8">
//           <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
//             Welcome to our service. These Terms and Conditions ("Terms") govern your use of our website, 
//             applications, and services (collectively, the "Service"). Please read these Terms carefully. 
//             By accessing or using our Service, you agree to be bound by these Terms. If you do not agree 
//             to any part of these Terms, you may not use our Service.
//           </p>
//         </div>

//         {/* Expand All Button */}
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//             Sections
//           </h2>
//           <button
//             onClick={toggleAllSections}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
//           >
//             {allExpanded ? 'Collapse All' : 'Expand All'}
//           </button>
//         </div>

//         {/* Sections */}
//         <div className="space-y-4 mb-8">
//           {sections.map(section => (
//             <div
//               key={section.id}
//               className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
//             >
//               <button
//                 onClick={() => toggleSection(section.id)}
//                 className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
//               >
//                 <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-left">
//                   {section.title}
//                 </h3>
//                 {expandedSections.includes(section.id) ? (
//                   <ChevronUp size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0 ml-2" />
//                 ) : (
//                   <ChevronDown size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0 ml-2" />
//                 )}
//               </button>

//               {expandedSections.includes(section.id) && (
//                 <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-200 dark:border-gray-700">
//                   <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
//                     {section.content}
//                   </p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Agreement Section */}
//         <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 mb-8">
//           <label className="flex items-start gap-3 sm:gap-4 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={agreed}
//               onChange={(e) => setAgreed(e.target.checked)}
//               className="w-5 h-5 mt-1 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
//             />
//             <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
//               I have read and agree to the Terms and Conditions above. I understand that by using this 
//               service, I am agreeing to be bound by all the terms outlined.
//             </span>
//           </label>

//           <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
//             <button
//               disabled={!agreed}
//               className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
//                 agreed
//                   ? 'bg-green-600 hover:bg-green-700 text-white'
//                   : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
//               }`}
//             >
//               <Check size={18} />
//               I Agree & Continue
//             </button>
//             <button 
//               onClick={() => window.history.back()}
//               className="flex-1 px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
//             >
//               Back
//             </button>
//           </div>
//         </div>

//         {/* Additional Info */}
//         <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6 text-sm text-gray-600 dark:text-gray-400">
//           <p className="mb-2">
//             <strong>Note:</strong> These Terms and Conditions are subject to change at any time. 
//             We recommend reviewing them periodically for updates.
//           </p>
//           <p>
//             For questions about these terms, please contact our support team at legal@example.com
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }