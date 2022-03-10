import './App.css';
import React, { useState, useEffect} from 'react';
import Moment from "react-moment";
import { Icon } from '@iconify/react';

function App() {
  window.resize = function () {buttonWidth()}
  const buttonWidth = () => {if(document.body.clientWidth>600){return 144}else{return 80}};
  let swapperPlace = buttonWidth();
  let frameCurrentNumber = 0;
  let latitude = 0;
  let longitude = 0;
  let http = ''
  const APIkey = '050d14d545237f20eb0dd223155660ef'
  const baseURL = 'http://api.openweathermap.org/data/2.5/'
  const citiesArrayEN = ['Выбрать город','Moscow', 'Tokyo', 'Tashkent', 'Kair','Toronto']
  const citiesArrayRU = ['Выбрать город','Москва', 'Токио', 'Tашкент', 'Каир','Торонто']
  
  //Swiper depending on screen width, cards width and left-and-right buttons
  const swap = function (i){
    let arrayLength = document.getElementsByClassName('timeline__moment').length;
    let cardWidth = document.getElementsByClassName('timeline__moment')[0].offsetWidth;

    //limitation for swiper from LEFT
    if(frameCurrentNumber-i>=0){
      const timeline = document.getElementById("timeline")
      swapperPlace = swapperPlace + i*cardWidth
      timeline.style.marginLeft = swapperPlace + 'px'
      frameCurrentNumber = frameCurrentNumber-i
    }
    //limitation for swiper from RIGHT
    if(frameCurrentNumber-i>arrayLength-Math.floor((document.body.clientWidth-(buttonWidth()*2))/cardWidth)){
      swapperPlace = swapperPlace - i*cardWidth
      frameCurrentNumber=frameCurrentNumber-1
    }
  }

  const [currentWeather, setCurrentWeather] = useState([])
  const [weatherForecast, setWeatherForecast] = useState([])
  const [currentCity, setCurrentCity] = useState('Ташкент')
  const [changeCityState, setChangeCityState] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [weatherPicture, setWeatherPicture] = useState('')

 const getCurrentWeather = function(lat="Tashkent", lon){
   if(lon){
      http = `${baseURL}weather?lat=${lat}&lon=${lon}&lang=ru&appid=${APIkey}`
  }else{
      http = `${baseURL}weather?q=${lat}&lang=ru&appid=${APIkey}`}
    fetch(http)
    .then(function(resp){return resp.json()})
    .then(function(data){
      setCurrentWeather([(Math.round(data.main.temp - 273)),
        data.weather[0].description, data.wind.speed,
      data.main.humidity, Math.round(data.main.pressure*760/1013),])
    })}

const getWeatherForecast = function(lat="Tashkent", lon){
  if(lon){
    http = `${baseURL}forecast?lat=${lat}&lon=${lon}&lang=ru&appid=${APIkey}`
}else{
    http = `${baseURL}forecast?q=${lat}&lang=ru&appid=${APIkey}`}
  fetch(http)
  .then(function(resp){return resp.json()})
  .then(function(data){

    //Change weather description in icons name
    for(let i = 0; i<data.list.length; i++){
      if(data.list[i].weather[0].main === 'Rain'){data.list[i].weather[0].main = 'nimbus:drop'}
      else if(data.list[i].weather[0].main === 'Clouds'){data.list[i].weather[0].main = 'bi:clouds'}
      else if(data.list[i].weather[0].main === 'Clear'){data.list[i].weather[0].main = 'bi:sun-fill'}
      else if(data.list[i].weather[0].main === 'Snow'){data.list[i].weather[0].main = 'bi:snow'}
    }
    setWeatherForecast(data)
    setWeatherPicture(data.list[1].weather[0].main)})
}

useEffect(()=>{getCurrentWeather()}, [])
useEffect(()=>{getWeatherForecast()}, [])

const getCityByCoordinates = (lat, lon) => {
  fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${APIkey}`)
  .then(function(resp){return resp.json()})
  .then(function(data){setCurrentCity(data[0].local_names.ru)})}
  
const getAPIdata = (latit, longit) => {
  latitude = latit;
  longitude = longit;
  getWeatherForecast(latitude, longitude)
  getCurrentWeather(latitude, longitude)
  getCityByCoordinates(latitude, longitude)
  setIsLoading(false)
}

const getWeather = (location) => {
  setIsLoading(true)
  if(!location){
    let watchID = navigator.geolocation.watchPosition(function(position) {
      getAPIdata(position.coords.latitude, position.coords.longitude);
    });
  }
}

const changeCity = () => {
  setChangeCityState(!changeCityState)
}

const setCity = (city) => {
  setIsLoading(true)
  setCurrentCity(citiesArrayRU[city])
  changeCity()
  getWeatherForecast(citiesArrayEN[city])
  getCurrentWeather(citiesArrayEN[city])
  setIsLoading(false)
}

  return (
    <div className='app'>
      <section className='header'>
        <div className='header__selected'>
        {changeCityState 
          ? <select className='header__list' id="cityList" 
                    onChange={()=>{setCity(document.getElementById('cityList')
                                          .options[document.getElementById('cityList')
                                          .selectedIndex].index)}}>
              {citiesArrayRU.map(m => <option>{m}</option>)}
            </select>
          : <div className='header__city'>{currentCity}</div>}
          <div className='header__time'>Сейчас&nbsp;&nbsp;<Moment format="HH:mm" interval={1000} /></div>
        </div>
        <div className='header__options'>
           <div className='header__changeCity' onClick={changeCity}>Сменить город</div>
          <div className='header__myLocation' onClick={()=>{getWeather(0)}}>
            <Icon className='header__icon' icon="map:location-arrow"/>
            моё местоположение
          </div>
        </div>
      </section>
      <section className='main'>
          {isLoading
          ? <div className='loading'>
              <div className='loading__blur'>
              </div>
              <div className='loading__text'>
              LOADING... <Icon className='loading__icon' icon='eos-icons:bubble-loading'/>
              </div>
            </div>
          : <div></div>}
          <div className='main__weather'>
            <Icon className='main__weather_icon' icon={weatherPicture}/>

            <div className='main__temperature'>{currentWeather[0]}°</div>
          </div>
          <div className='main__description'>{currentWeather[1]}</div>
          <div className='main__moreInfo'>
            <div><Icon className='main__icon' icon="bi:wind" />{currentWeather[2]} м/с</div>
            <div><Icon className='main__icon' icon="nimbus:drop" />{currentWeather[3]} %</div>
            <div><Icon className='main__icon' icon="mdi:car-tire-alert" />{currentWeather[4]} мм.рт.ст</div>
          </div>
      </section>
      <section className='timeline'>
        <div className='timeline__edge'>
          <button className='timeline__button' onClick={()=>{swap(1)}}>
            <Icon className='timeline__arrow' icon="fa:angle-left" />
            &nbsp;&nbsp;
          </button>
        </div>
        <div className='timeline__line' id="timeline">
        {weatherForecast.list !== undefined 
        ? weatherForecast.list.map(m => 
          <div className='timeline__moment'>
            <div className='timeline__time'>{m.dt_txt.slice(11, 16)}</div>
            <div className='timeline__picture'>
              <Icon className='timeline__icon' icon={m.weather[0].main} />
            </div>
            <div className='timeline__temperature'>{Math.round(m.main.temp-273)}°</div>
          </div>) 
        : <div></div>}
        </div>
        <div className='timeline__edge' id='edge'>
          <button className='timeline__button' onClick={()=>{swap(-1)}}>
            &nbsp;&nbsp;
            <Icon className='timeline__arrow' icon="fa:angle-right" />
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;