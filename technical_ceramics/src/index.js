import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
function Header({value}) {
  return(
    <div class="Header">
      <p class="HeaderP">{value}</p>
    </div>
  );
}
ReactDOM.render(
  <React.StrictMode>
    <Header value="Technical Ceramics analisys"/>

    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
