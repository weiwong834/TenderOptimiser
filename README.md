# Tender Optimizer

A comprehensive web application for analyzing, comparing, and optimizing tender offers in procurement and project bidding contexts.

## 🚀 Features

### 📊 Dashboard
- Overview of all tender data
- Quick statistics and metrics
- Recent activity tracking
- Quick navigation to key features

### 📝 Tender Input
- **Manual Entry**: Add and edit tender offers with detailed information
- **Document Upload**: Upload PDF, Word documents, images, or text files for automatic data extraction
- **AI-Powered Extraction**: Automatically extract tender information from uploaded documents
- **Batch Processing**: Process multiple documents simultaneously
- **Data Validation**: Review and edit extracted data before saving
- Comprehensive form with all relevant fields:
  - Supplier information
  - Cost and currency
  - Delivery timeframes
  - Quality and reliability scores
  - Risk assessment
  - Technical specifications

### 📈 Analysis
- Visual charts and graphs using Recharts
- Cost vs Quality analysis
- Delivery time distribution
- Supplier performance metrics
- Statistical breakdowns

### ⚡ Optimization
- Advanced algorithm for tender selection
- Weighted scoring system
- Multi-criteria decision making
- Detailed reasoning and recommendations
- Risk assessment integration

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Document Processing**: OCR and text extraction algorithms
- **File Upload**: Drag-and-drop with validation

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tender-optimizer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 📋 Usage Guide

### 1. Adding Tenders
- Navigate to "Input Tenders" page
- Click "Add Tender" button
- Fill in all required fields
- Save the tender

### 2. Analyzing Tenders
- Go to "Analysis" page
- View comprehensive charts and metrics
- Compare different aspects of tenders

### 3. Optimizing Selection
- Visit "Optimization" page
- Click "Run Optimization"
- Review the algorithm's recommendations
- Analyze the reasoning behind selections

## 🎯 Optimization Algorithm

The tender optimizer uses a sophisticated weighted scoring system that considers:

- **Cost (30%)**: Lower costs receive higher scores
- **Quality (25%)**: Higher quality scores improve ranking
- **Delivery Time (15%)**: Faster delivery times are preferred
- **Reliability (10%)**: Supplier reliability assessment
- **Technical Score (10%)**: Technical capability evaluation
- **Financial Stability (5%)**: Financial health consideration
- **Past Performance (3%)**: Historical performance data
- **Risk Level (2%)**: Risk assessment with multipliers

### Scoring Formula
```
Total Score = (Cost Score × 0.30) + (Quality Score × 0.25) + 
              (Delivery Score × 0.15) + (Reliability Score × 0.10) +
              (Technical Score × 0.10) + (Financial Score × 0.05) +
              (Performance Score × 0.03) + (Risk Score × 0.02)
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Header.tsx      # Navigation header
├── context/            # React context for state management
│   └── TenderContext.tsx
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Overview dashboard
│   ├── TenderInput.tsx # Tender input form
│   ├── Analysis.tsx    # Analysis and charts
│   └── Optimization.tsx # Optimization algorithm
├── types/              # TypeScript type definitions
│   └── tender.ts       # Tender-related types
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🎨 Customization

### Styling
The application uses Tailwind CSS for styling. You can customize the design by modifying:
- `tailwind.config.js` - Tailwind configuration
- `src/index.css` - Global styles and custom components

### Optimization Criteria
Adjust the optimization weights in `src/context/TenderContext.tsx`:
```typescript
criteria: {
  costWeight: 30,
  qualityWeight: 25,
  deliveryWeight: 15,
  // ... other weights
}
```

## 🔧 Development

### Adding New Features
1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update types in `src/types/tender.ts`
4. Modify context if needed in `src/context/TenderContext.tsx`

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Maintain consistent naming conventions

## 📊 Data Structure

### TenderOffer Interface
```typescript
interface TenderOffer {
  id: string
  supplierName: string
  projectName: string
  totalCost: number
  currency: string
  deliveryTime: number
  qualityScore: number
  reliabilityScore: number
  technicalScore: number
  financialStability: number
  pastPerformance: number
  riskLevel: 'low' | 'medium' | 'high'
  description: string
  submissionDate: string
  validityPeriod: number
  terms: string
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ for better procurement decisions** 