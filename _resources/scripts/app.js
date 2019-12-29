const setGlobalVhValue = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setGlobalVhValue();
window.addEventListener('resize', setGlobalVhValue);

import './map';
import './charts';
import './commits';
