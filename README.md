# Crypto / Stock Tracker (AlphaVantage) Dashboard - Angular v20 

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
<img width="534" height="486" alt="image" src="https://github.com/user-attachments/assets/b1305b01-bcbd-4694-9fa7-cce27bc72435" />


-------

## Setup Instructions

1. Clone the repository:
   ```bash
    git clone https://github.com/Ashiq11/crypto_stock_tracker.git
    cd crypto-stock-tracker
2. Install dependencies (using Yarn):
   ```bash
    yarn install
3. Add your Alpha Vantage API key:
   ```bash
   // src/environments/environment.ts
   export const environment = {
    production: false,
    alphaVantageApiKey: 'QSJHUZEUS1BQAQCD', // replace with your key
    
4. Run the application:
    ```bash
    yarn start
5. Open in browser:
   http://localhost:4200
-------
## Dashboard Visualization 
<img width="1350" height="607" alt="image" src="https://github.com/user-attachments/assets/80e13c21-491d-4474-940e-f77c1ba794d2" />
<img width="1343" height="571" alt="image" src="https://github.com/user-attachments/assets/f504c742-176f-40ef-96f5-156461da5c13" />
<img width="1285" height="602" alt="image" src="https://github.com/user-attachments/assets/626d446b-fc9f-47bf-a520-d297b17fe73a" />


