import { createStore } from 'redux';

const INITIAL_STATE = {
  btc: 0,
  ltc: 0,
  euro: 0,
  eth: 0,
  isAvailable: false,
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.state };
  }
};

const store = createStore(reducer, {});

export default store;