import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './satoshi.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import store from './redux/store.ts'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
    <Provider store={store}>
      <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        </Routes>
        <ToastContainer/>
      </BrowserRouter>
    </Provider>
    </AuthProvider>
  </React.StrictMode>,
)
