import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey="pk_test_Y2l2aWwtaWJleC04Ni5jbGVyay5hY2NvdW50cy5kZXYk">
      <App />
    </ClerkProvider>
  </StrictMode>,
)
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
// CLERK_SECRET_KEY=sk_test_kM0en00Juef0fLtMFVI5cFkigdaAYUowZRXXX6G5dh