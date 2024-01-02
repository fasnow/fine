import ReactDOM from 'react-dom/client';
import './index.css';
import {App, AppWithReactActivation} from './App';
import reportWebVitals from './reportWebVitals';
import { render } from 'react-dom';

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<AppWithReactActivation/>);//react 18 但是显示有bug
render(<AppWithReactActivation/>, document.getElementById('root'));//react 17 但是显示无bug
reportWebVitals();
