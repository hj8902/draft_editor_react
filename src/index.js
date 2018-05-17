import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from 'react-hot-loader/lib/AppContainer';

import { createStore } from 'redux';
import { Provider } from 'react-redux';

import reducers from './reducers';
import App from './app/App';

const store = createStore(reducers);
const container = document.getElementById('container');
const render = (Component) => {
    ReactDOM.render(
        <AppContainer>
            <Provider store={ store }>
                <Component />
            </Provider>
        </AppContainer>,
        container,
    );
};

render(App);

// hot loader
if (module.hot) { module.hot.accept('./app/App', () => render(App)); }
