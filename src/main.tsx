import './style/global.less';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { ConfigProvider } from '@arco-design/web-react';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import { BrowserRouter, Switch, Route, HashRouter } from 'react-router-dom';
import { registerMicroApps, start } from 'qiankun';
import axios from 'axios';
import rootReducer from './store';
import PageLayout from './layout';
import { GlobalContext } from './context';
import Login from './pages/login';
import checkLogin from './utils/checkLogin';
import changeTheme from './utils/changeTheme';
import useStorage from './utils/useStorage';
import './mock';

const store = createStore(rootReducer);

export const vue2AppEntry = import.meta.env.VITE_VUE2_CHILD_ENTRY;
export const reactAppEntry = import.meta.env.VITE_REACT18_CHILD_ENTRY;
export const viteAppEntry = import.meta.env.VITE_VITE_CHILD_ENTRY;

function Index() {
  const [lang, setLang] = useStorage('arco-lang', 'en-US');
  const [theme, setTheme] = useStorage('arco-theme', 'light');

  function getArcoLocale() {
    switch (lang) {
      case 'zh-CN':
        return zhCN;
      case 'en-US':
        return enUS;
      default:
        return zhCN;
    }
  }

  function fetchUserInfo() {
    store.dispatch({
      type: 'update-userInfo',
      payload: { userLoading: true },
    });
    axios.get('/api/user/userInfo').then((res) => {
      store.dispatch({
        type: 'update-userInfo',
        payload: { userInfo: res.data, userLoading: false },
      });
    });
  }

  useEffect(() => {
    if (checkLogin()) {
      fetchUserInfo();
    } else if (window.location.pathname.replace(/\//g, '') !== 'login') {
      window.location.pathname = '/login';
    }
  }, []);

  useEffect(() => {
    changeTheme(theme);
  }, [theme]);

  const contextValue = {
    lang,
    setLang,
    theme,
    setTheme,
  };

  return (
    <HashRouter>
      <ConfigProvider
        locale={getArcoLocale()}
        componentConfig={{
          Card: {
            bordered: false,
          },
          List: {
            bordered: false,
          },
          Table: {
            border: false,
          },
        }}
      >
        <Provider store={store}>
          <GlobalContext.Provider value={contextValue}>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/" component={PageLayout} />
            </Switch>
          </GlobalContext.Provider>
        </Provider>
      </ConfigProvider>
    </HashRouter>
  );
}

// registerMicroApps(
//   [
//     {
//       name: 'vite-app',
//       entry: 'http://localhost:8093',
//       container: '#child-app',
//       activeRule: '#/viteApp',
//     },
//     {
//       name: 'react-app',
//       entry: 'http://localhost:8092',
//       container: '#child-app',
//       activeRule: '#/reactApp',
//     },
//     {
//       name: 'vue-app',
//       entry: 'http://localhost:8091',
//       container: '#child-app',
//       activeRule: '#/vue2App'
//     },
//     {
//       name: 'acro-pro-all',
//       entry: 'http://localhost:3000',
//       container: '#child-app',
//       activeRule: '#/acroProAll'
//     }
//   ],
//   {
//     beforeLoad: [
//       (app) => {
//         console.log('[主应用] before load', app.name);
//         return Promise.resolve();
//       },
//     ],
//     beforeMount: [
//       (app) => {
//         console.log('[主应用] before mount', app.name);
//         return Promise.resolve();
//       },
//     ],
//     afterMount: [
//       (app) => {
//         console.log('[主应用] after mount', app.name);
//         return Promise.resolve();
//       },
//     ],
//   }
// );

// start({
//   prefetch: true,
//   sandbox: {
//     experimentalStyleIsolation: true,
//   },
// });

ReactDOM.render(<Index />, document.getElementById('root'));
