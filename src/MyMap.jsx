import React, { useEffect, useState } from 'react';

function MyMap() {
  const [weather, setWeather] = useState(null); // 新增状态用于存储天气信息

  useEffect(() => {
    if (window.google) {
      const google = window.google;
      const mapOptions = {
        zoom: 4,
        center: { lat: -34.397, lng: 150.644 },
      };

      const map = new google.maps.Map(document.getElementById('map'), mapOptions);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const pos = { lat, lng: lon };

            map.setCenter(pos);
            new google.maps.Marker({
              position: pos,
              map: map,
              title: 'Your location',
            });

            // 天气API的URL，包括用户的API key
            const apiKey = '52ea1583e6659f903af0648580b5c517';
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            // 获取天气信息
            fetch(weatherUrl)
              .then(response => response.json())
              .then(data => {
                setWeather(data); // 将天气信息保存到状态中
              })
              .catch(error => console.log('Error fetching weather:', error));
          },
          () => {
            console.error('Error: The Geolocation service failed.');
          }
        );
      } else {
        console.error('Error: Your browser doesn\'t support geolocation.');
      }
    }
  }, []);

  return (
    <div>
      <div id="map" style={{ height: 500, width: 300 }} />
      {weather && (
        <div>
          <h3>Weather Information</h3>
          <p>Location: {weather.name} </p>
          <p>Temperature: {weather.main.temp} °C</p>
          <p>Condition: {weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );
}

export default MyMap;
