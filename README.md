# Crypto / Stock Tracker (AlphaVantage) - Angular v20 

# Cryptocurrency & Stock Tracker Dashboard

## Overview

This project is a single-page Angular (v20+) application designed to track and compare cryptocurrencies and stocks in real-time. Users can search for assets, view current details, track historical price trends, and compare multiple assets side-by-side. The dashboard leverages **Alpha Vantage API** for stock and cryptocurrency data, **Angular Material** for polished UI, and **Chart.js** for dynamic data visualization.  

---

## Features

- **Type-ahead Search:**  
  - Search for cryptocurrencies or stocks with real-time suggestions.  
  - Debounced API calls to avoid excessive requests.  
  - Cancel pending requests if the user continues typing.  
  - Graceful handling of no results or API errors.  

- **Comparison Table:**  
  - Add up to 5 assets to compare side-by-side.  
  - Displays key metrics such as current price, market cap, last updated, and currency.  
  - Assets can be removed individually or cleared entirely.  
  - Automatically updates metrics when time range changes.  

- **Historical Chart:**  
  - Displays historical price trends of selected assets.  
  - Selectable time ranges: 7 days, 30 days, 6 months, 1 year.  
  - Interactive line chart using Chart.js.  

- **Modern Angular 20 Syntax:**  
  - Replaced deprecated `*ngIf` / `*ngFor` with `@if` and `@for` control flow blocks.  
  - Fully reactive using `RxJS` streams and async pipes.  
  - State management via `AssetStoreService` for selected assets.  

---

## Technical Details

- **Frameworks & Libraries:**  
  - Angular 20+ (standalone components)  
  - Angular Material (for forms, buttons, cards, and icons)  
  - RxJS (for reactive data streams, debouncing, and request cancellation)  
  - Chart.js (line charts for historical data)  

- **Services:**  
  - `MarketService` – handles all API calls to Alpha Vantage.  
  - `AssetStoreService` – manages selected assets and their states using observables.  

- **API:**  
  - Alpha Vantage (`https://www.alphavantage.co/documentation/`)  
  - Endpoints used:  
    - `TIME_SERIES_INTRADAY` – intraday stock/crypto prices  
    - `TIME_SERIES_DAILY` – historical daily prices  

- **Reactive Patterns:**  
  - Debounced search input with `distinctUntilChanged`, `switchMap`, and cancellation of previous requests.  
  - Observables stream into the template using async pipe for automatic updates.  

- **Error Handling:**  
  - API errors are captured and displayed in the UI (`something went wrong`, `no results found`).  
  - Edge cases handled:  
    - Empty search input  
    - API returning empty results  
    - Assets without certain metrics (market cap, currency, last updated)  

- **UI/UX:**  
  - Clean, responsive layout using Angular Material cards and grid system.  
  - Icons scaled properly and aligned using CSS.  
  - Chart updates dynamically when assets are added/removed or time range changes.  

---

## Sequence Diagram:
User types “AAPL”
    ↓
SearchComponent (debounced input)
    ↓
AssetStoreService.searchAssets("AAPL")
    ↓
MarketService (calls SYMBOL_SEARCH endpoint)
    ↓
Alpha Vantage → JSON list of matching stocks
    ↓
SearchComponent shows dropdown
    ↓
User clicks “Apple Inc (AAPL)”
    ↓
AssetStoreService.addAsset("AAPL", "stock")
    ↓
MarketService.getStockDaily("AAPL")
    ↓
Parsed { date, open, high, low, close }[]
    ↓
ChartComponent + ComparisonComponent render candlestick chart + table

-------

## Setup Instructions

1. Clone the repository:  
```bash
git clone https://github.com/Ashiq11/crypto_stock_tracker.git
cd crypto-stock-tracker

    Install dependencies (using Yarn):

yarn install

    Add your Alpha Vantage API key:

// src/environments/environment.ts
export const environment = {
  production: false,
  alphaVantageApiKey: 'QSJHUZEUS1BQAQCD', // replace with your key
};

    Run the application:

yarn start

    Open in browser:

http://localhost:4200


-------
