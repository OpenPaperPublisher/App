import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import { invoke } from '@tauri-apps/api'

function App() {

  invoke('get_auth_url').then((url) => {
    document.getElementById("auth_url")?.setAttribute("href", String(url));
  })
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <a
            id="auth_url"
            className='auth_url'
            href=""
            target="_blank"
          >
            Obtain Auth Key
          </a>
        </p>
        <p>
          <input type='text' id="auth-code" placeholder='Paste authentication code here' />
          <button onClick={() => {
            let code = (document.getElementById("auth-code") as HTMLInputElement).value;
            invoke('finalize_auth', { code });
          }}>Submit</button>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
      </header>
    </div>
  )
}

export default App
