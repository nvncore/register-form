import React from 'react';
import { RegisterForm } from './components/RegisterForm';

export const App: React.FC = () => {
  return (
    <>
      <div className="blob-1" />
      <div className="blob-2" />
      <main className="app-container">
        <RegisterForm />
      </main>
    </>
  );
};

export default App;
