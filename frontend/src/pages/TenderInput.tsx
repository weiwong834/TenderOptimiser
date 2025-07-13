import { useState } from 'react'
import { useTender } from '../context/TenderContext'
import { TenderOffer } from '../types/tender'
import { X, Upload, FileText, CheckCircle, Sparkles, ArrowRight, TrendingUp } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import { useNavigate } from 'react-router-dom'

const TenderInput = () => {
  const { state, dispatch } = useTender()
  const [isUploadMode, setIsUploadMode] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processingFiles, setProcessingFiles] = useState(false)
  const [expandedSummary, setExpandedSummary] = useState<number | null>(null)
  const navigate = useNavigate()

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this tender?')) {
      dispatch({ type: 'DELETE_TENDER', payload: id })
    }
  }

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files)
  }

  const processUploadedFiles = async () => {
    if (uploadedFiles.length === 0) return;

    setProcessingFiles(true);
    try {
      const file = uploadedFiles[0];
      const text = await file.text();

      const response = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Uploaded Tender",
          description: text,
          estimated_value: "1000000 SGD" // You can extract this later from the file
        })
      });

      const result = await response.json();
      console.log("API response:", result);

      const tender: TenderOffer = {
        id: `tender-${Date.now()}`,
        supplierName: "You",
        projectName: result.keywords.join(", "),
        totalCost: result.bid_recommendation.bid_range_max_amt || 0,
        currency: "SGD",
        deliveryTime: 30,
        qualityScore: (result.pricing_analysis.stats?.avg_ratio || 0.75) * 10,
        reliabilityScore: 7,
        technicalScore: 7,
        financialStability: 6,
        pastPerformance: 8,
        riskLevel: result.bid_recommendation.risk_level?.toLowerCase() || "medium",
        description: result.bid_recommendation.reasoning || "AI analysis result",
        submissionDate: new Date().toISOString().split("T")[0],
        validityPeriod: 30,
        terms: ""
      };

      dispatch({ type: 'CLEAR_ALL' });
      dispatch({ type: 'ADD_TENDER', payload: tender });

      setIsUploadMode(false);
      setUploadedFiles([]);
    } catch (error) {
      console.error("❌ Error during API call:", error);
      alert("Could not analyze tender. Please try again.");
    } finally {
      setProcessingFiles(false);
    }
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tender Analysis</h1>
        <button
          onClick={() => setIsUploadMode(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Tender</span>
        </button>
      </div>

      {/* Current Tender Analysis */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Tender Analysis</h2>
        {state.tenders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tender uploaded yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Upload a tender document to analyze it against historical data and get insights.</p>
            <button
              onClick={() => setIsUploadMode(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Upload Tender Document
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {state.tenders.map((tender) => (
              <div key={tender.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tender.supplierName}</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">{tender.projectName}</p>
                </div>
                
                {/* Calculate scores based on the new weighted criteria */}
                {(() => {
                  const relevance = tender.qualityScore || 7.5
                  const profitability = tender.technicalScore || 8.0
                  const resourcesFeasibility = tender.reliabilityScore || 7.0
                  const risk = tender.financialStability || 6.5
                  const strategicValue = tender.pastPerformance || 8.5
                  
                  // Calculate weighted total score
                  const totalScore = (
                    (relevance * 0.25) +
                    (profitability * 0.30) +
                    (resourcesFeasibility * 0.20) +
                    (risk * 0.15) +
                    (strategicValue * 0.10)
                  )
                  
                  // Quality score = total score / 10
                  const qualityScore = (totalScore / 10).toFixed(1)
                  
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Relevance</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{relevance}/10</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">25%</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Profitability</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{profitability}/10</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">30%</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Resources</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{resourcesFeasibility}/10</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">20%</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Risk</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{risk}/10</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">15%</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Strategic</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{strategicValue}/10</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">10%</p>
                      </div>
                    </div>
                  )
                })()}
                
                {/* Overall Score */}
                {(() => {
                  const relevance = tender.qualityScore || 7.5
                  const profitability = tender.technicalScore || 8.0
                  const resourcesFeasibility = tender.reliabilityScore || 7.0
                  const risk = tender.financialStability || 6.5
                  const strategicValue = tender.pastPerformance || 8.5
                  
                  const totalScore = (
                    (relevance * 0.25) +
                    (profitability * 0.30) +
                    (resourcesFeasibility * 0.20) +
                    (risk * 0.15) +
                    (strategicValue * 0.10)
                  )
                  
                  const qualityScore = (totalScore / 10).toFixed(1)
                  
                  return (
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Score</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalScore.toFixed(1)}/10</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quality Score: {qualityScore}/10</p>
                    </div>
                  )
                })()}
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ready for detailed analysis</p>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => navigate('/summary')}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Summary</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tender.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Upload Documents Modal */}
      {isUploadMode && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upload Tender Document
              </h2>
              <button
                onClick={() => {
                  setIsUploadMode(false)
                  setUploadedFiles([])
                  setExtractedData(null)
                  setSummaries([])
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 dark:text-purple-200 mb-2">How it works:</h3>
                <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
                  <li>• Upload a single tender document (PDF, Word, image, or text)</li>
                  <li>• Our AI will extract tender information automatically</li>
                  <li>• Review the extracted data and AI-generated summaries</li>
                  <li>• Run detailed analysis against historical data</li>
                </ul>
              </div>

              <FileUpload
                onFilesSelected={handleFilesSelected}
                acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt']}
                maxFiles={1}
                maxSize={10}
              />

              {uploadedFiles.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      Document ready for analysis
                    </span>
                  </div>
                  <button
                    onClick={processUploadedFiles}
                    disabled={processingFiles}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{processingFiles ? 'Processing...' : 'Analyze Tender'}</span>
                  </button>
                </div>
              )}

              {extractedData && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-medium text-green-900 dark:text-green-200">Tender Analysis Ready!</h3>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Document processed successfully. Ready to analyze against historical data.
                    Confidence: {(extractedData.confidence * 100).toFixed(1)}%
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-green-800 dark:text-green-200">
                    {extractedData.supplierName && (
                      <div><strong>Supplier:</strong> {extractedData.supplierName}</div>
                    )}
                    {extractedData.projectName && (
                      <div><strong>Project:</strong> {extractedData.projectName}</div>
                    )}

                    {extractedData.deliveryTime && (
                      <div><strong>Delivery:</strong> {extractedData.deliveryTime} days</div>
                    )}
                  </div>
                  
                  {/* Scoring Preview */}
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-600">
                    <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-2">Initial Scoring:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-green-800 dark:text-green-200">
                      <div><strong>Relevance:</strong> {(extractedData.qualityScore || 7.5).toFixed(1)}/10</div>
                      <div><strong>Profitability:</strong> {(extractedData.technicalScore || 8.0).toFixed(1)}/10</div>
                      <div><strong>Resources:</strong> {(extractedData.reliabilityScore || 7.0).toFixed(1)}/10</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Summaries Section */}
              {summaries.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-medium text-gray-900 dark:text-white">AI-Generated Summaries</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {summaries.map((item, index) => (
                      <SummaryDisplay
                        key={index}
                        summary={item.summary}
                        fileName={item.file.name}
                        isExpanded={expandedSummary === index}
                        onToggleExpand={() => setExpandedSummary(
                          expandedSummary === index ? null : index
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {generatingSummaries && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 dark:border-purple-400"></div>
                    <span className="text-purple-700 dark:text-purple-300">Generating AI summaries...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TenderInput 