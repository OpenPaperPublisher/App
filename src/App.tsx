import { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import { invoke } from '@tauri-apps/api'


const Pages = {
  AuthPage: 'AuthPage',
  MainPage: 'MainPage',
  ErrorPage: 'ErrorPage',
}

interface BaseParams {
  setState: (state: string) => void,
}
const AuthPage = (props: BaseParams) => {

  const [authUrl, setAuthUrl] = useState("");

  //We need to wrap this in useEffect so it only happens on first render, otherwise, on state change, react would rerender again and loop
  useEffect(() => {
    invoke('get_auth_url').then((url) => {
      setAuthUrl(String(url));
    })
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <a
            id="auth_url"
            className='auth_url'
            href={authUrl}
            target="_blank"
          >
            Obtain Auth Key
          </a>
        </p>
        <p>
          <input type='text' id="auth-code" placeholder='Paste authentication code here' />
          <button onClick={() => {
            const code: string = (document.getElementById("auth-code") as HTMLInputElement).value;
            invoke('finalize_auth', { code })
              .catch((err) => console.error(err))
              .then(() => props.setState(Pages.MainPage));
          }}>Submit</button>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
      </header>
    </div >
  )
};

const MainPage = (props: BaseParams) => {

  useEffect(() => {
    invoke('upsert_template').catch((err) => { console.error(err) });
  }, []);

  return (
    < div className="App" >
      <div className='nav'>
      </div>
    </div>
  )
};

const ErrorPage = () => {
  return (
    <div>Error, this page occurs when the app attemps to swap to a page that doesn't exist. Please open an issue if you ever see this page</div>
  )
}

function App() {

  const [state, setState] = useState(Pages.AuthPage);

  //depending on the state of the app (set through an enum, the app will display a specific page)
  switch (state) {
    case Pages.AuthPage:
      return <AuthPage setState={setState} />;
    case Pages.MainPage:
      return <MainPage setState={setState} />;
    default:
      return <ErrorPage />
  }

}

export default App
