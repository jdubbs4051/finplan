# Financial Forecast Planner

A React-based web application for building comprehensive financial forecasts across multiple account types including 401(k), dividend investing accounts, high-yield savings accounts (HYSA), and regular brokerage accounts.

## Features

- **User Profile Management**: Capture current age, retirement age, current salary, and expected salary growth
- **Multiple Account Types**: 
  - 401(k) with company match support and IRS limit validation
  - Dividend investing accounts with DRIP options
  - High-yield savings accounts (HYSA)
  - Regular brokerage accounts
- **Independent Forecasts**: Each account is forecasted independently with account-specific calculations
- **Aggregated View**: See combined forecasts across all accounts
- **Visualizations**: Interactive charts and detailed tables showing year-by-year breakdowns
- **Data Persistence**: Backend API with SQLite database for persistent data storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm run server
```

The backend server will run on `http://localhost:3001`

3. Start the frontend development server (in a new terminal):
```bash
npm run dev
```

Or run both simultaneously:
```bash
npm run dev:full
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Create Your Profile**: Start by entering your current age, retirement age, current salary, and expected salary growth rate.

2. **Add Accounts**: 
   - Click "Add Account" and select an account type
   - Fill in the required information for each account:
     - **401(k)**: Current balance, monthly contribution, time horizon, rate of return, and company match details (if applicable)
     - **Dividend Account**: Current balance, monthly contribution, time horizon, expected yield, underlying asset growth, and DRIP option
     - **HYSA**: Current balance, monthly contribution, time horizon, and APY
     - **Brokerage**: Current balance, monthly contribution, time horizon, and expected return rate

3. **View Forecasts**: 
   - Navigate to the "Forecast" tab
   - Toggle between aggregated view (all accounts combined) and individual account views
   - Switch between chart and table visualizations

## Account Types Details

### 401(k) Account
- Validates annual contributions against IRS limits ($23,000 for under 50, $30,500 for 50+)
- Supports company match calculations based on salary percentage
- Accounts for salary growth over time affecting match calculations
- Default rate of return suggestions: 7-10% (long-term historical average)

### Dividend Investing Account
- Supports dividend yield and underlying asset growth
- DRIP (Dividend Reinvestment Plan) option for automatic dividend reinvestment
- When DRIP is enabled, dividends compound monthly
- When DRIP is disabled, dividends are paid out and don't affect balance growth

### HYSA Account
- Simple compound interest calculation with monthly contributions
- APY-based growth calculation

### Brokerage Account
- Standard compound growth calculation with monthly contributions
- Custom expected return rate

## Technical Details

- **Framework**: React 18 with Vite
- **Charts**: Recharts
- **State Management**: React Context API
- **Backend**: Express.js with SQLite database
- **API**: RESTful API for profile and accounts management
- **Storage**: SQLite database (persistent server-side storage)
- **Styling**: CSS Modules

## Project Structure

```
planning/
├── server/                   # Backend server
│   ├── index.js             # Express server entry point
│   ├── database.js          # SQLite database setup and migrations
│   ├── routes/              # API routes
│   │   ├── profile.js       # Profile CRUD endpoints
│   │   └── accounts.js      # Accounts CRUD endpoints
│   └── data/                # SQLite database files (auto-created)
├── src/
│   ├── components/
│   │   ├── Profile/          # User profile components
│   │   ├── Accounts/         # Account management components
│   │   ├── Forecast/         # Forecast visualization components
│   │   └── Layout/           # Layout components (Header, Navigation)
│   ├── context/              # React Context for global state
│   ├── utils/                # Utility functions (calculations, storage, constants)
│   ├── App.jsx               # Main app component
│   └── main.jsx              # Entry point
├── public/                   # Static assets
├── package.json
└── vite.config.js
```

## Backend API

The backend provides RESTful API endpoints:

### Profile Endpoints
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create or update user profile
- `DELETE /api/profile` - Delete user profile

### Accounts Endpoints
- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/:id` - Get a specific account
- `POST /api/accounts` - Create a new account
- `PUT /api/accounts/:id` - Update an account
- `DELETE /api/accounts/:id` - Delete an account

### Health Check
- `GET /api/health` - Check server status

## Future Enhancements

- Export forecast data to CSV/PDF
- Additional account types
- Scenario planning (best case, worst case, expected)
- Inflation adjustments
- Tax considerations
- Docker containerization support

## License

MIT
