import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Scale, Book, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';
import LegalReference from './LegalReference';
import { analyzeCaseWithAI, type AIAnalysis } from '../services/gemini';
import { jsPDF } from 'jspdf';

const Analysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const caseDetails = location.state?.caseDetails;
  // const [translatedText, setTranslatedText] = useState<string | null>(null);

  useEffect(() => {
    if (!caseDetails) {
      setError('No case details provided. Please go back and fill in the case information.');
      setLoading(false);
      return;
    }

    const performAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const analysis = await analyzeCaseWithAI(caseDetails);
        
        if (!analysis || !Array.isArray(analysis.applicableLaws) || !analysis.legalImplications) {
          throw new Error('The AI response was not in the expected format. Please try again.');
        }

        setAiAnalysis(analysis);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    performAnalysis();
  }, [caseDetails, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleContinue = () => {
    if (!aiAnalysis) return;
    
    navigate('/verdict', { 
      state: { 
        caseDetails,
        aiAnalysis 
      } 
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Digital Lawyer PK - Case Analysis", 10, 10);
    doc.setFontSize(12);
    
    let currentY = 20; // Start Y position for text

    // Add case details
    doc.text(`Case Type: ${caseDetails.caseType}`, 10, currentY);
    currentY += 10; // Move down for the next line
    doc.text(`Date: ${caseDetails.date}`, 10, currentY);
    currentY += 10;
    doc.text(`Location: ${caseDetails.location}`, 10, currentY);
    currentY += 15; // Add extra space before the next section

    // Add AI analysis results
    doc.setFontSize(14);
    doc.text("Applicable Laws:", 10, currentY);
    currentY += 10;
    doc.setFontSize(12);
    aiAnalysis.applicableLaws.forEach((law, index) => {
      if (currentY > 270) { // Check if the Y position is near the bottom of the page
        doc.addPage(); // Add a new page
        currentY = 10; // Reset Y position for the new page
      }
      doc.text(`- ${law}`, 10, currentY);
      currentY += 10;
    });

    // Add legal implications
    doc.setFontSize(14);
    doc.text("Legal Implications:", 10, currentY);
    currentY += 10;
    doc.setFontSize(12);
    const legalImplicationsLines = doc.splitTextToSize(aiAnalysis.legalImplications, 190); // Split text to fit within the page width
    legalImplicationsLines.forEach(line => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 10;
      }
      doc.text(line, 10, currentY);
      currentY += 10;
    });

    // Add recommendations
    doc.setFontSize(14);
    doc.text("Recommendations:", 10, currentY);
    currentY += 10;
    doc.setFontSize(12);
    aiAnalysis.recommendations.forEach((rec, index) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 10;
      }
      doc.text(`- ${rec}`, 10, currentY);
      currentY += 10;
    });

    // Add risk level
    doc.setFontSize(14);
    doc.text("Risk Level:", 10, currentY);
    currentY += 10;
    doc.setFontSize(12);
    doc.text(`${aiAnalysis.risk.toUpperCase()}`, 10, currentY);
    currentY += 15; // Add extra space before the next section

    // Add additional notes
    if (aiAnalysis.additionalNotes) {
      doc.setFontSize(14);
      doc.text("Additional Notes:", 10, currentY);
      currentY += 10;
      doc.setFontSize(12);
      const additionalNotesLines = doc.splitTextToSize(aiAnalysis.additionalNotes, 190);
      additionalNotesLines.forEach(line => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 10;
        }
        doc.text(line, 10, currentY);
        currentY += 10;
      });
      doc.text("Digital Lawyer PK - Case Analysis made by @naeem_pansota-Github/NP-55555", 10, 10);
      
    }

    // Add dynamic case details (e.g., cheating, criminal breach of trust)
    const additionalDetails = [
      {
        title: "Cheating and dishonestly inducing delivery of property",
        section: "Section 420",
        punishment: "Imprisonment up to 7 years, and fine",
        bookReferences: "Commentary on the Pakistan Penal Code, Author: M. Mahmood, Edition: 2021, Pages: 542-547",
        relevantCases: "PLD 2019 SC 442, 2018 SCMR 772"
      },
      {
        title: "Criminal breach of trust",
        section: "Section 406",
        punishment: "Imprisonment up to 7 years, or fine, or both",
        bookReferences: "Principles of Criminal Law in Pakistan, Author: C.M. Shafqat, Edition: 2020, Pages: 234-238",
        relevantCases: "2020 PCrLJ 1123, PLD 2017 Lahore 589"
      },
      {
        title: "Information in cognizable cases",
        section: "Section 154",
        bookReferences: "Criminal Procedure in Pakistan, Author: Justice (R) Khurshid Alam, Edition: 2022, Pages: 112-118",
        relevantCases: "2021 SCMR 442"
      }
    ];

    additionalDetails.forEach((detail, index) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 10;
      }
      doc.setFontSize(14);
      doc.text(detail.title, 10, currentY);
      currentY += 10;
      doc.setFontSize(12);
      doc.text(detail.section, 10, currentY);
      currentY += 10;
      if (detail.punishment) {
        doc.text(`Punishment: ${detail.punishment}`, 10, currentY);
        currentY += 10;
      }
      doc.text(`Book References: ${detail.bookReferences}`, 10, currentY);
      currentY += 10;
      doc.text(`Relevant Cases: ${detail.relevantCases}`, 10, currentY);
      currentY += 15; // Add extra space before the next detail
    });

    // Save the PDF
    doc.save("analysis.pdf");
  };

  // const translateToUrdu = () => {
  //   const translation = `
  //     کیس کی قسم: ${caseDetails.caseType}
  //     تاریخ: ${caseDetails.date}
  //     مقام: ${caseDetails.location}
  //     قابل اطلاق قوانین: ${aiAnalysis.applicableLaws.join(', ')}
  //     قانونی مضمرات: ${aiAnalysis.legalImplications}
  //     سفارشات: ${aiAnalysis.recommendations.join(', ')}
  //     خطرے کی سطح: ${aiAnalysis.risk.toUpperCase()}
  //     اضافی نوٹس: ${aiAnalysis.additionalNotes || 'کوئی اضافی نوٹس نہیں'}
  //   `;
  //   setTranslatedText(translation);
  // };

  const handlePoliceStationClick = () => {
    navigate('/police-station-map');
  };

  if (!caseDetails) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-900/20 p-6 rounded-lg border border-red-700">
          <div className="flex items-center text-red-400 mb-4">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">Missing Case Details</h3>
          </div>
          <p className="text-gray-300">Please return to the previous page and provide case details.</p>
          <button
            onClick={() => navigate('/case-input')}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="mt-4 text-white text-lg">Analyzing your case with AI...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-900/20 p-6 rounded-lg border border-red-700">
          <div className="flex items-center text-red-400 mb-4">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">Analysis Error</h3>
          </div>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (aiAnalysis) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Scale className="h-6 w-6 mr-2 text-emerald-500" />
            AI-Powered Case Analysis
          </h2>

          <div className="space-y-6">
            <div className="bg-black/20 p-6 rounded-lg border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold text-emerald-400 mb-3">Case Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <p><span className="text-white font-medium">Case Type:</span> {caseDetails.caseType}</p>
                <p><span className="text-white font-medium">Date:</span> {caseDetails.date}</p>
                <p><span className="text-white font-medium">Location:</span> {caseDetails.location}</p>
              </div>
            </div>

            <div className="bg-black/20 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">AI Analysis Results</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Applicable Laws:</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {aiAnalysis.applicableLaws.map((law, index) => (
                      <li key={index}>{law}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Legal Implications:</h4>
                  <p className="text-gray-300">{aiAnalysis.legalImplications}</p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {aiAnalysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-white">Risk Level:</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    aiAnalysis.risk === 'high' ? 'bg-red-900/50 text-red-400' :
                    aiAnalysis.risk === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-green-900/50 text-green-400'
                  }`}>
                    {aiAnalysis.risk.toUpperCase()}
                  </span>
                </div>

                {aiAnalysis.additionalNotes && (
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Additional Notes:</h4>
                    <p className="text-gray-300">{aiAnalysis.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            <LegalReference caseType={caseDetails.caseType} />

            <button
              onClick={handleContinue}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              <span>View Detailed Verdict</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={generatePDF}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePoliceStationClick}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              <span>Nearby Police Stations</span>
            </button>
            {/* <button
              onClick={translateToUrdu}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              <span>Translate to Urdu</span>
            </button>
            
            {translatedText && (
              <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg">
                <h3 className="font-bold mb-2">Translated Analysis:</h3>
                <pre>{translatedText}</pre>
              </div>
            )} */}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Analysis;