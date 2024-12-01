import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Gavel, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { AIAnalysis } from '../services/gemini';

const Verdict = () => {
  const location = useLocation();
  const { caseDetails, aiAnalysis: initialAnalysis } = location.state as { 
    caseDetails: any;
    aiAnalysis?: AIAnalysis;
  };

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Initial AI Analysis:', initialAnalysis);
    try {
      if (!initialAnalysis) {
        throw new Error('AI response is null or undefined.');
      }
      if (!Array.isArray(initialAnalysis.applicableLaws)) {
        throw new Error('Applicable laws should be an array.');
      }
      if (typeof initialAnalysis.legalImplications !== 'string') {
        throw new Error('Legal implications should be a string.');
      }
      if (!Array.isArray(initialAnalysis.recommendations)) {
        throw new Error('Recommendations should be an array.');
      }
      if (typeof initialAnalysis.risk !== 'string') {
        throw new Error('Risk should be a string.');
      }
      
      setAiAnalysis(initialAnalysis);
    } catch (err) {
      console.error(err);
      setError(`Failed to process the AI response: ${err.message}`);
    }
  }, [initialAnalysis]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Legal Assessment and Recommendations", 10, 10);
    
    // Add applicable laws
    doc.setFontSize(12);
    doc.text("Applicable Laws:", 10, 20);
    aiAnalysis?.applicableLaws.forEach((law, index) => {
      doc.text(`${index + 1}. ${law}`, 10, 30 + (index * 10));
    });

    // Add legal implications
    doc.text("Legal Implications:", 10, 30 + (aiAnalysis?.applicableLaws.length * 10) + 10);
    doc.text(aiAnalysis?.legalImplications, 10, 40 + (aiAnalysis?.applicableLaws.length * 10) + 10);

    // Add recommendations
    doc.text("Recommended Actions:", 10, 50 + (aiAnalysis?.applicableLaws.length * 10) + 20);
    aiAnalysis?.recommendations.forEach((rec, index) => {
      doc.text(`${index + 1}. ${rec}`, 10, 60 + (aiAnalysis?.applicableLaws.length * 10) + (index * 10) + 20);
    });

    // Save the PDF
    doc.save("verdict_details.pdf");
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-500/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-red-700">
          <h2 className="text-xl font-bold text-red-400 text-center">Error</h2>
          <p className="text-gray-300 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!aiAnalysis) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-gray-700">
          <h2 className="text-xl font-bold text-center text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={generatePDF} className="mb-4 p-2 bg-blue-500 text-white rounded">
        Download PDF
      </button>
      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-gray-700">
        <div className="flex items-center justify-center mb-8">
          <Gavel className="h-12 w-12 text-emerald-500" />
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-8">
          Legal Assessment and Recommendations
        </h2>

        <div className="space-y-8">
          <div className="bg-black/20 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Applicable Laws
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-2 text-gray-300">
              {aiAnalysis.applicableLaws.map((law, index) => (
                <li key={index}>{law}</li>
              ))}
            </ul>
          </div>

          <div className="bg-black/20 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Legal Implications
            </h3>
            <p className="text-gray-300">{aiAnalysis.legalImplications}</p>
          </div>

          <div className="bg-black/20 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Recommended Actions
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-300">
              {aiAnalysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ol>
          </div>

          <div className="bg-emerald-900/20 p-6 rounded-lg border border-emerald-700">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">
              Important Notice
            </h3>
            <p className="text-gray-300">
              This analysis is based on the information provided and serves as a preliminary
              legal assessment generated by AI. It is strongly recommended to consult with a qualified legal
              practitioner for detailed guidance specific to your case. Laws and their
              interpretation may vary based on specific circumstances and jurisdiction.
            </p>
            {aiAnalysis.additionalNotes && (
              <div className="mt-4 pt-4 border-t border-emerald-700">
                <h4 className="font-medium text-emerald-400 mb-2">Additional Notes:</h4>
                <p className="text-gray-300">{aiAnalysis.additionalNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verdict;
