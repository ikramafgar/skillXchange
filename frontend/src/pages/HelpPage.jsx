import { useState } from "react";
import { ChevronDown, CheckCircle, Award, Users } from "lucide-react";

const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I get verified as a teacher?",
      answer:
        "To become a verified teacher, upload your certificates and portfolio links during profile setup. Our admin team will review and approve your request if everything meets the requirements.",
      icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
    },
    {
      question: "How does the reward system work?",
      answer:
        "Teachers earn points for each session taught. Points can be redeemed for gift cards, premium features, and exclusive rewards. Top mentors also get leaderboard badges.",
      icon: <Award className="w-6 h-6 text-green-500" />,
    },
    {
      question: "What is the difference between teaching and learning roles?",
      answer:
        "Teaching allows you to host sessions and earn rewards, while learning lets you attend sessions to acquire new skills. You can select both roles for a complete experience.",
      icon: <Users className="w-6 h-6 text-purple-500" />,
    },
    {
      question: "Can I switch my role from learner to teacher?",
      answer:
        "Absolutely! You can switch your role or choose both roles anytime from your profile settings.",
      icon: <CheckCircle className="w-6 h-6 text-teal-500" />,
    },
    {
      question: "How do I contact support?",
      answer:
        "If you need help, reach out to us via the support section on the platform or send an email to support@skillxchange.com.",
      icon: <Award className="w-6 h-6 text-orange-500" />,
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-8">
        <h2 className="text-center text-4xl font-bold text-gray-900 mb-8">
          Help & FAQs
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-6 focus:outline-none"
              >
                <div className="flex items-center space-x-4">
                  {faq.icon}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-gray-600 transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
