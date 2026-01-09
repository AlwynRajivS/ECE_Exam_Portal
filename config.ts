
/**
 * KAMARAJ COLLEGE - INSTITUTIONAL CONFIG
 * 
 * 1. Open Google Sheets.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste the content of 'gas-backend.gs'.
 * 4. Deploy > New Deployment > Web App (Access: Anyone).
 * 5. Paste the URL below.
 */

// 1. DATABASE CONNECTION
export const GAS_URL: string = "https://script.google.com/macros/s/AKfycbzxEQegsB4aA94bYw8WwGiX9zV0MxnLHCYnWa6MOXSPdjGNkWJPOUhmqSgJ3_JFDtTO/exec"; 

// 2. ADMINISTRATIVE CREDENTIALS (CHANGE THESE FOR SECURITY)
export const ADMIN_ID = "KCET-COE-ADMIN";
export const ADMIN_PASSWORD = "admin123";

// 3. SYSTEM STATE
export const API_ENABLED = GAS_URL !== "" && GAS_URL.startsWith("https://script.google.com");
